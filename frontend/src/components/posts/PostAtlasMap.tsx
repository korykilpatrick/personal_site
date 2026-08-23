import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  AnimatePresence,
  MotionConfig,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  cameraForPoint,
  cameraToRevealPoint,
  clampCameraTranslation,
  MAX_ATLAS_SCALE,
  MIN_ATLAS_SCALE,
  zoomCameraAround,
  type AtlasCamera,
} from './postAtlasCamera';
import { findDirectionalNodeId, isAtlasDirectionKey } from './postAtlasNavigation';
import { formatReadingMinutes } from '@/content/posts/postText';
import { getRelatedPosts } from '@/content/posts/graph/selectors';
import type {
  ContentEdge,
  ContentGraph,
  ContentTaxonomy,
  PostSummary,
  PostGraphLayout,
} from '@/content/posts/types';

const FIELD_WIDTH = 1400;
const FIELD_HEIGHT = 860;
const COMPACT_FIELD_WIDTH = 700;
const COMPACT_FIELD_HEIGHT = 1000;

interface PostAtlasMapProps {
  posts: readonly PostSummary[];
  graph: ContentGraph;
  taxonomy: ContentTaxonomy;
  layout: PostGraphLayout;
  visibleSlugs: ReadonlySet<string>;
  selectedThemeId?: string;
  focusedSlug?: string;
  compactOverview?: boolean;
  onFocusPost: (slug?: string) => void;
  onSelectTheme: (themeId?: string) => void;
  onSelectConcept: (conceptId?: string) => void;
  postsOrigin?: string;
  onPrefetchPost?: (slug: string) => void;
}

interface FieldPoint {
  x: number;
  y: number;
}

interface AtlasPanSession {
  pointerId: number;
  clientX: number;
  clientY: number;
  cameraX: number;
  cameraY: number;
}

const curveFor = (from: FieldPoint, to: FieldPoint, seed: string): string => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.max(1, Math.hypot(dx, dy));
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }
  const bend = ((hash % 1000) / 1000 - 0.5) * Math.min(92, length * 0.24);
  const controlX = (from.x + to.x) / 2 + (-dy / length) * bend;
  const controlY = (from.y + to.y) / 2 + (dx / length) * bend;
  return `M ${from.x.toFixed(2)} ${from.y.toFixed(2)} Q ${controlX.toFixed(2)} ${controlY.toFixed(2)} ${to.x.toFixed(2)} ${to.y.toFixed(2)}`;
};

const bundledCurveFor = (
  from: FieldPoint,
  to: FieldPoint,
  fromTheme: FieldPoint,
  toTheme: FieldPoint,
): string => {
  const firstControl = {
    x: from.x + (fromTheme.x - from.x) * 0.72,
    y: from.y + (fromTheme.y - from.y) * 0.72,
  };
  const secondControl = {
    x: to.x + (toTheme.x - to.x) * 0.72,
    y: to.y + (toTheme.y - to.y) * 0.72,
  };
  return `M ${from.x.toFixed(2)} ${from.y.toFixed(2)} C ${firstControl.x.toFixed(2)} ${firstControl.y.toFixed(2)} ${secondControl.x.toFixed(2)} ${secondControl.y.toFixed(2)} ${to.x.toFixed(2)} ${to.y.toFixed(2)}`;
};

const postSlugFromNode = (nodeId: string): string | null =>
  nodeId.startsWith('post:') ? nodeId.slice('post:'.length) : null;

const postToPostEdge = (edge: ContentEdge): boolean =>
  edge.from.startsWith('post:') && edge.to.startsWith('post:');

const PostAtlasMap: React.FC<PostAtlasMapProps> = ({
  posts,
  graph,
  taxonomy,
  layout,
  visibleSlugs,
  selectedThemeId,
  focusedSlug,
  compactOverview = false,
  onFocusPost,
  onSelectTheme,
  onSelectConcept,
  postsOrigin = '/posts',
  onPrefetchPost,
}) => {
  const reduceMotion = useReducedMotion();
  const fieldRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const nodeButtonRefs = useRef(new Map<string, HTMLButtonElement>());
  const themeButtonRefs = useRef(new Map<string, HTMLButtonElement>());
  const focusReturnSlugRef = useRef<string>();
  const lastDossierSlugRef = useRef<string>();
  const cameraAnimationsRef = useRef<Array<ReturnType<typeof animate>>>([]);
  const panSessionRef = useRef<AtlasPanSession>();
  const cameraX = useMotionValue(0);
  const cameraY = useMotionValue(0);
  const cameraScale = useMotionValue(1);
  const inverseCameraScale = useTransform(cameraScale, (scale) => 1 / scale);
  const [hoveredSlug, setHoveredSlug] = useState<string>();
  const [hoveredThemeId, setHoveredThemeId] = useState<string>();
  const [keyboardThemeId, setKeyboardThemeId] = useState<string | undefined>(
    selectedThemeId ?? taxonomy.themes[0]?.id,
  );
  const [keyboardPostSlug, setKeyboardPostSlug] = useState<string | undefined>(
    focusedSlug ?? posts[0]?.slug,
  );
  const [cameraViewport, setCameraViewport] = useState({
    width: FIELD_WIDTH,
    height: FIELD_HEIGHT,
  });
  const [isPanning, setIsPanning] = useState(false);
  const [cameraZoom, setCameraZoom] = useState(1);
  const [atlasSeen, setAtlasSeen] = useState(Boolean(reduceMotion));
  const observedSlug = focusedSlug ?? hoveredSlug;
  const focusedPost = focusedSlug ? posts.find((post) => post.slug === focusedSlug) : undefined;
  const fieldWidth = compactOverview ? COMPACT_FIELD_WIDTH : FIELD_WIDTH;
  const fieldHeight = compactOverview ? COMPACT_FIELD_HEIGHT : FIELD_HEIGHT;
  const compactThemeDetail = compactOverview && Boolean(selectedThemeId);

  const cameraContentPoints = useMemo<readonly FieldPoint[]>(() => {
    const themeIds = compactThemeDetail
      ? selectedThemeId
        ? [`theme:${selectedThemeId}`]
        : []
      : taxonomy.themes.map((theme) => `theme:${theme.id}`);
    const postIds =
      compactOverview && !selectedThemeId
        ? []
        : posts.filter((post) => visibleSlugs.has(post.slug)).map((post) => `post:${post.slug}`);
    const points = [...themeIds, ...postIds]
      .map((nodeId) => layout.nodes[nodeId as keyof typeof layout.nodes])
      .filter((point): point is FieldPoint => Boolean(point));
    return points;
  }, [
    compactOverview,
    compactThemeDetail,
    layout.nodes,
    posts,
    selectedThemeId,
    taxonomy.themes,
    visibleSlugs,
  ]);

  const themeById = useMemo(
    () => new Map(taxonomy.themes.map((theme) => [theme.id, theme])),
    [taxonomy.themes],
  );
  const conceptById = useMemo(
    () => new Map(taxonomy.concepts.map((concept) => [concept.id, concept])),
    [taxonomy.concepts],
  );
  const postBySlug = useMemo(() => new Map(posts.map((post) => [post.slug, post])), [posts]);
  const themeCounts = useMemo(() => {
    const counts = new Map<string, number>();
    posts.forEach((post) => {
      counts.set(post.themes.primary, (counts.get(post.themes.primary) ?? 0) + 1);
    });
    return counts;
  }, [posts]);
  const landmarkSlugs = useMemo(() => {
    const landmarks = new Set(posts.filter((post) => post.featured).map((post) => post.slug));
    const provenanceWeight = { authored: 3, 'body-link': 2, inferred: 0.5 } as const;
    taxonomy.themes.forEach((theme) => {
      const [mostConnected] = posts
        .filter((post) => post.themes.primary === theme.id)
        .map((post) => ({
          post,
          score: (graph.adjacency.get(`post:${post.slug}`) ?? [])
            .filter((edge) => postToPostEdge(edge))
            .reduce((sum, edge) => sum + provenanceWeight[edge.provenance], 0),
        }))
        .sort(
          (left, right) =>
            Number(right.post.featured) - Number(left.post.featured) ||
            right.score - left.score ||
            left.post.order - right.post.order,
        );
      if (mostConnected) landmarks.add(mostConnected.post.slug);
    });
    return landmarks;
  }, [graph.adjacency, posts, taxonomy.themes]);

  const observedRelations = useMemo(() => {
    if (!observedSlug) return [];
    const limit = focusedSlug ? 5 : 3;
    return getRelatedPosts(graph, observedSlug, {
      includeInferred: Boolean(focusedSlug),
      limit: posts.length,
    })
      .filter((relation) => visibleSlugs.has(relation.post.slug))
      .slice(0, limit);
  }, [focusedSlug, graph, observedSlug, posts.length, visibleSlugs]);
  const relatedPosts = useMemo(
    () => (focusedPost ? getRelatedPosts(graph, focusedPost.slug, { limit: 4 }) : []),
    [focusedPost, graph],
  );
  const observedEdgeIds = useMemo(
    () => new Set(observedRelations.map((relation) => relation.edge.id)),
    [observedRelations],
  );
  const observedSlugs = useMemo(() => {
    const slugs = new Set<string>();
    if (observedSlug) slugs.add(observedSlug);
    observedRelations.forEach((relation) => slugs.add(relation.post.slug));
    return slugs;
  }, [observedRelations, observedSlug]);
  const observedThemeIds = useMemo(() => {
    const themeIds = new Set<string>();
    observedSlugs.forEach((slug) => {
      const themeId = postBySlug.get(slug)?.themes.primary;
      if (themeId) themeIds.add(themeId);
    });
    return themeIds;
  }, [observedSlugs, postBySlug]);
  const previewThemeId = observedSlug ? undefined : (selectedThemeId ?? hoveredThemeId);

  const themeMembershipEdges = useMemo(
    () =>
      graph.edges.filter(
        (edge) =>
          edge.kind === 'theme-membership' && edge.rank === 0 && edge.from.startsWith('post:'),
      ),
    [graph.edges],
  );
  const postEdges = useMemo(
    () => graph.edges.filter((edge) => postToPostEdge(edge)),
    [graph.edges],
  );
  const ambientThemeBridges = useMemo(() => {
    const bridges = new Map<
      string,
      { fromThemeId: string; toThemeId: string; postPairs: Set<string> }
    >();
    postEdges.forEach((edge) => {
      if (edge.provenance !== 'authored') return;
      const fromSlug = postSlugFromNode(edge.from);
      const toSlug = postSlugFromNode(edge.to);
      if (!fromSlug || !toSlug) return;
      if (!visibleSlugs.has(fromSlug) || !visibleSlugs.has(toSlug)) return;
      const fromThemeId = postBySlug.get(fromSlug)?.themes.primary;
      const toThemeId = postBySlug.get(toSlug)?.themes.primary;
      if (!fromThemeId || !toThemeId || fromThemeId === toThemeId) return;
      const [leftThemeId, rightThemeId] = [fromThemeId, toThemeId].sort();
      const key = `${leftThemeId}|${rightThemeId}`;
      const bridge = bridges.get(key) ?? {
        fromThemeId: leftThemeId,
        toThemeId: rightThemeId,
        postPairs: new Set<string>(),
      };
      bridge.postPairs.add([fromSlug, toSlug].sort().join('|'));
      bridges.set(key, bridge);
    });
    return [...bridges.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([id, bridge]) => ({ ...bridge, id, count: bridge.postPairs.size }));
  }, [postBySlug, postEdges, visibleSlugs]);
  const normalizedPointFor = useCallback(
    (nodeId: string): FieldPoint | null => {
      const point = layout.nodes[nodeId as keyof typeof layout.nodes];
      return point ? { x: point.x, y: point.y } : null;
    },
    [layout.nodes],
  );
  const fieldPointFor = useCallback(
    (nodeId: string): FieldPoint | null => {
      const point = normalizedPointFor(nodeId);
      return point ? { x: point.x * fieldWidth, y: point.y * fieldHeight } : null;
    },
    [fieldHeight, fieldWidth, normalizedPointFor],
  );

  const navigableThemePoints = useMemo(
    () =>
      taxonomy.themes
        .filter((theme) => !compactThemeDetail || theme.id === selectedThemeId)
        .flatMap((theme) => {
          const point = fieldPointFor(`theme:${theme.id}`);
          return point ? [{ id: theme.id, ...point }] : [];
        }),
    [compactThemeDetail, fieldPointFor, selectedThemeId, taxonomy.themes],
  );
  const navigablePostPoints = useMemo(
    () =>
      posts
        .filter(
          (post) => visibleSlugs.has(post.slug) && (!compactOverview || Boolean(selectedThemeId)),
        )
        .flatMap((post) => {
          const point = fieldPointFor(`post:${post.slug}`);
          return point ? [{ id: post.slug, ...point }] : [];
        }),
    [compactOverview, fieldPointFor, posts, selectedThemeId, visibleSlugs],
  );
  const activeThemeTabId = navigableThemePoints.some((point) => point.id === keyboardThemeId)
    ? keyboardThemeId
    : navigableThemePoints[0]?.id;
  const activePostTabSlug = navigablePostPoints.some((point) => point.id === keyboardPostSlug)
    ? keyboardPostSlug
    : navigablePostPoints[0]?.id;

  useEffect(() => {
    if (reduceMotion) {
      setAtlasSeen(true);
      return undefined;
    }
    const field = fieldRef.current;
    if (!field || typeof IntersectionObserver === 'undefined') {
      setAtlasSeen(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setAtlasSeen(true);
        observer.disconnect();
      },
      { threshold: 0.12 },
    );
    observer.observe(field);
    return () => observer.disconnect();
  }, [reduceMotion]);

  const moveCamera = useCallback(
    (camera: AtlasCamera, immediate = false) => {
      const boundedCamera = clampCameraTranslation(
        camera,
        cameraViewport,
        0.14,
        cameraContentPoints,
      );
      setCameraZoom(boundedCamera.scale);
      cameraAnimationsRef.current.forEach((controls) => controls.stop());
      cameraAnimationsRef.current = [];
      if (reduceMotion || immediate) {
        cameraX.set(boundedCamera.x);
        cameraY.set(boundedCamera.y);
        cameraScale.set(boundedCamera.scale);
        return;
      }
      const transition = { type: 'spring' as const, stiffness: 170, damping: 28, mass: 0.88 };
      cameraAnimationsRef.current = [
        animate(cameraX, boundedCamera.x, transition),
        animate(cameraY, boundedCamera.y, transition),
        animate(cameraScale, boundedCamera.scale, transition),
      ];
    },
    [cameraContentPoints, cameraScale, cameraViewport, cameraX, cameraY, reduceMotion],
  );

  const getAutomaticCamera = useCallback((): AtlasCamera => {
    if (focusedSlug) {
      const point = normalizedPointFor(`post:${focusedSlug}`);
      if (point) {
        return cameraForPoint(point, {
          fieldWidth: cameraViewport.width,
          fieldHeight: cameraViewport.height,
          scale: compactOverview ? 2.55 : 1.42,
          screenX: compactOverview ? 0.5 : 0.31,
          screenY: compactOverview ? 0.24 : 0.5,
        });
      }
    }
    if (selectedThemeId) {
      const point = normalizedPointFor(`theme:${selectedThemeId}`);
      if (point) {
        return cameraForPoint(point, {
          fieldWidth: cameraViewport.width,
          fieldHeight: cameraViewport.height,
          scale: compactOverview ? 2.4 : 1.24,
          screenX: 0.5,
          screenY: compactOverview ? 0.48 : 0.5,
        });
      }
    }
    return { x: 0, y: 0, scale: 1 };
  }, [
    cameraViewport.height,
    cameraViewport.width,
    compactOverview,
    focusedSlug,
    normalizedPointFor,
    selectedThemeId,
  ]);

  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return undefined;
    const updateSize = () => {
      const bounds = field.getBoundingClientRect();
      if (bounds.width > 0 && bounds.height > 0) {
        setCameraViewport({ width: bounds.width, height: bounds.height });
      }
    };
    updateSize();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(updateSize);
    observer.observe(field);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    moveCamera(getAutomaticCamera());
  }, [getAutomaticCamera, moveCamera]);

  useEffect(
    () => () => {
      cameraAnimationsRef.current.forEach((controls) => controls.stop());
    },
    [],
  );

  useEffect(() => {
    if (activeThemeTabId !== keyboardThemeId) setKeyboardThemeId(activeThemeTabId);
  }, [activeThemeTabId, keyboardThemeId]);

  useEffect(() => {
    if (activePostTabSlug !== keyboardPostSlug) setKeyboardPostSlug(activePostTabSlug);
  }, [activePostTabSlug, keyboardPostSlug]);

  useLayoutEffect(() => {
    if (focusedPost) {
      if (lastDossierSlugRef.current && lastDossierSlugRef.current !== focusedPost.slug) {
        focusReturnSlugRef.current = undefined;
      }
      lastDossierSlugRef.current = focusedPost.slug;
      closeButtonRef.current?.focus({ preventScroll: true });
      const dossier = closeButtonRef.current?.closest<HTMLElement>('.post-atlas-dossier');
      return () => {
        if (dossier?.contains(document.activeElement) && !focusReturnSlugRef.current) {
          focusReturnSlugRef.current = focusedPost.slug;
        }
      };
    }

    const slug = focusReturnSlugRef.current;
    lastDossierSlugRef.current = undefined;
    if (!slug) return undefined;
    focusReturnSlugRef.current = undefined;
    const frame = requestAnimationFrame(() => {
      nodeButtonRefs.current.get(slug)?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [focusedPost]);

  const closeDossier = useCallback(() => {
    focusReturnSlugRef.current = focusedSlug;
    onFocusPost(undefined);
  }, [focusedSlug, onFocusPost]);

  const selectConceptFromDossier = useCallback(
    (conceptId: string) => {
      focusReturnSlugRef.current = focusedSlug;
      onSelectConcept(conceptId);
    },
    [focusedSlug, onSelectConcept],
  );

  useEffect(() => {
    if (!focusedSlug) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeDossier();
        return;
      }
      const dossier = closeButtonRef.current?.closest<HTMLElement>('.post-atlas-dossier');
      if (event.key !== 'Tab' || !dossier || !compactOverview) return;

      const focusable = Array.from(
        dossier.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeDossier, compactOverview, focusedSlug]);

  useEffect(() => {
    if (!focusedPost || !compactOverview) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [compactOverview, focusedPost]);

  useEffect(() => {
    if (focusedSlug || (!hoveredSlug && !hoveredThemeId)) return undefined;
    const dismissHoverPreview = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setHoveredSlug(undefined);
      setHoveredThemeId(undefined);
    };
    document.addEventListener('keydown', dismissHoverPreview);
    return () => document.removeEventListener('keydown', dismissHoverPreview);
  }, [focusedSlug, hoveredSlug, hoveredThemeId]);

  const zoomCamera = useCallback(
    (factor: number, anchor?: FieldPoint, immediate = false) => {
      const screenPoint = anchor ?? {
        x: cameraViewport.width / 2,
        y: cameraViewport.height / 2,
      };
      moveCamera(
        zoomCameraAround(
          { x: cameraX.get(), y: cameraY.get(), scale: cameraScale.get() },
          screenPoint,
          cameraScale.get() * factor,
        ),
        immediate,
      );
    },
    [cameraScale, cameraViewport.height, cameraViewport.width, cameraX, cameraY, moveCamera],
  );

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (!event.ctrlKey || !fieldRef.current || (focusedPost && compactOverview)) return;
    event.preventDefault();
    const bounds = fieldRef.current.getBoundingClientRect();
    zoomCamera(
      Math.exp(-event.deltaY * 0.005),
      { x: event.clientX - bounds.left, y: event.clientY - bounds.top },
      true,
    );
  };

  const handleMapPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const canPanWithPointer =
      event.pointerType === 'mouse' ||
      ((Boolean(selectedThemeId) || cameraZoom > 1.001) &&
        ['pen', 'touch'].includes(event.pointerType));
    if (
      (focusedPost && compactOverview) ||
      !canPanWithPointer ||
      event.button !== 0 ||
      (event.target as Element).closest('button, a')
    ) {
      return;
    }
    cameraAnimationsRef.current.forEach((controls) => controls.stop());
    setCameraZoom(cameraScale.get());
    event.preventDefault();
    panSessionRef.current = {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      cameraX: cameraX.get(),
      cameraY: cameraY.get(),
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setIsPanning(true);
  };

  const handleMapPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const session = panSessionRef.current;
    if (!session || session.pointerId !== event.pointerId) return;
    const boundedCamera = clampCameraTranslation(
      {
        x: session.cameraX + event.clientX - session.clientX,
        y: session.cameraY + event.clientY - session.clientY,
        scale: cameraScale.get(),
      },
      cameraViewport,
      0.14,
      cameraContentPoints,
    );
    cameraX.set(boundedCamera.x);
    cameraY.set(boundedCamera.y);
    panSessionRef.current = {
      pointerId: session.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      cameraX: boundedCamera.x,
      cameraY: boundedCamera.y,
    };
  };

  const endMapPan = (event: React.PointerEvent<HTMLDivElement>) => {
    if (panSessionRef.current?.pointerId !== event.pointerId) return;
    panSessionRef.current = undefined;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setIsPanning(false);
  };

  const revealNode = (nodeId: string) => {
    const point = normalizedPointFor(nodeId);
    if (!point) return;
    moveCamera(
      cameraToRevealPoint(
        { x: cameraX.get(), y: cameraY.get(), scale: cameraScale.get() },
        { x: point.x * cameraViewport.width, y: point.y * cameraViewport.height },
        cameraViewport,
        0.13,
        cameraContentPoints,
      ),
    );
  };

  const returnToAllThemes = () => {
    const previousThemeId = selectedThemeId;
    if (focusedSlug) focusReturnSlugRef.current = focusedSlug;
    onSelectTheme(undefined);
    if (!previousThemeId) return;
    setKeyboardThemeId(previousThemeId);
    requestAnimationFrame(() => {
      themeButtonRefs.current.get(previousThemeId)?.focus({ preventScroll: true });
    });
  };

  const moveThemeFocus = (event: React.KeyboardEvent<HTMLButtonElement>, themeId: string) => {
    if (event.key === 'Escape' && focusedSlug) return;
    if (event.key === 'Escape' && selectedThemeId) {
      event.preventDefault();
      returnToAllThemes();
      return;
    }
    if (!isAtlasDirectionKey(event.key)) return;
    event.preventDefault();
    const nextId = findDirectionalNodeId(navigableThemePoints, themeId, event.key);
    if (!nextId) return;
    setKeyboardThemeId(nextId);
    themeButtonRefs.current.get(nextId)?.focus({ preventScroll: true });
    revealNode(`theme:${nextId}`);
  };

  const movePostFocus = (event: React.KeyboardEvent<HTMLButtonElement>, slug: string) => {
    if (event.key === 'Escape' && focusedSlug) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      if (selectedThemeId) returnToAllThemes();
      else setHoveredSlug(undefined);
      return;
    }
    if (!isAtlasDirectionKey(event.key)) return;
    event.preventDefault();
    const nextSlug = findDirectionalNodeId(navigablePostPoints, slug, event.key);
    if (!nextSlug) return;
    setKeyboardPostSlug(nextSlug);
    nodeButtonRefs.current.get(nextSlug)?.focus({ preventScroll: true });
    revealNode(`post:${nextSlug}`);
  };

  const focusNodeId = observedSlug ? `post:${observedSlug}` : undefined;

  return (
    <MotionConfig reducedMotion="user">
      <section
        className="post-atlas-map-wrap"
        aria-label="Post map"
        aria-describedby="post-atlas-description"
      >
        <div
          ref={fieldRef}
          className={`post-atlas-map${compactOverview ? ' is-compact-overview' : ''}${
            focusedPost ? ' has-dossier' : ''
          }${selectedThemeId ? ' has-theme-selection' : ''}${
            cameraZoom > 1.001 ? ' is-zoomed' : ''
          }${isPanning ? ' is-panning' : ''}`}
          onPointerDown={handleMapPointerDown}
          onPointerMove={handleMapPointerMove}
          onPointerUp={endMapPan}
          onPointerCancel={endMapPan}
          onLostPointerCapture={() => {
            panSessionRef.current = undefined;
            setIsPanning(false);
          }}
          onPointerLeave={() => {
            setHoveredSlug(undefined);
            setHoveredThemeId(undefined);
          }}
          onWheel={handleWheel}
        >
          <p id="post-atlas-description" className="sr-only">
            Interactive map of {posts.length} posts in {taxonomy.themes.length} themes. Tab enters
            the theme group
            {compactOverview && !selectedThemeId
              ? '; choose a theme to reveal its posts.'
              : ' and post groups; arrow keys move spatially within each group.'}{' '}
            Enter opens a post. Escape moves back one level.
          </p>

          <svg
            className="post-atlas-grain-layer"
            viewBox={`0 0 ${fieldWidth} ${fieldHeight}`}
            aria-hidden="true"
            preserveAspectRatio="none"
          >
            <defs>
              <filter id="atlas-paper-grain" x="-15%" y="-15%" width="130%" height="130%">
                <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="2" seed="11" />
                <feColorMatrix type="saturate" values="0" />
                <feComponentTransfer>
                  <feFuncA type="table" tableValues="0 0.065" />
                </feComponentTransfer>
              </filter>
            </defs>
            <rect className="post-atlas-grain" width={fieldWidth} height={fieldHeight} />
          </svg>

          <motion.div
            className="post-atlas-scene"
            style={{ x: cameraX, y: cameraY, scale: cameraScale }}
          >
            <svg
              className="post-atlas-field-lines"
              viewBox={`0 0 ${fieldWidth} ${fieldHeight}`}
              aria-hidden="true"
              preserveAspectRatio="none"
            >
              {taxonomy.themes.map((theme, themeIndex) => {
                const point = fieldPointFor(`theme:${theme.id}`);
                if (!point) return null;
                const selected = selectedThemeId === theme.id;
                const observed = observedSlug
                  ? observedThemeIds.has(theme.id)
                  : previewThemeId === theme.id;
                const muted = observedSlug ? !observed : Boolean(previewThemeId && !observed);
                return (
                  <g
                    key={theme.id}
                    className={`post-atlas-contours${selected ? ' is-selected' : ''}${
                      muted ? ' is-muted' : ''
                    }${observed ? ' is-observed' : ''}${
                      compactThemeDetail && muted ? ' is-compact-muted' : ''
                    }`}
                    data-tone={theme.tone}
                    transform={`rotate(${themeIndex % 2 === 0 ? -7 : 8} ${point.x} ${point.y})`}
                  >
                    {[0, 1, 2].map((ring) => (
                      <motion.ellipse
                        key={ring}
                        initial={false}
                        animate={{
                          cx: point.x,
                          cy: point.y,
                          rx: (compactOverview ? 49 : 92) + ring * (compactOverview ? 23 : 42),
                          ry: (compactOverview ? 49 : 62) + ring * (compactOverview ? 23 : 30),
                        }}
                        transition={
                          reduceMotion
                            ? { duration: 0 }
                            : { type: 'spring', stiffness: 115, damping: 24 }
                        }
                      />
                    ))}
                  </g>
                );
              })}

              {!observedSlug &&
                !previewThemeId &&
                ambientThemeBridges.map((bridge) => {
                  const from = fieldPointFor(`theme:${bridge.fromThemeId}`);
                  const to = fieldPointFor(`theme:${bridge.toThemeId}`);
                  if (!from || !to) return null;
                  const curve = curveFor(from, to, `theme-bridge:${bridge.id}`);
                  const tone = themeById.get(bridge.fromThemeId)?.tone;
                  return (
                    <motion.path
                      key={bridge.id}
                      d={curve}
                      className="post-atlas-theme-bridge"
                      data-tone={tone}
                      style={{ strokeWidth: 0.65 + Math.min(bridge.count, 4) * 0.17 }}
                      initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
                      animate={{
                        d: curve,
                        pathLength: atlasSeen ? 1 : 0,
                        opacity: atlasSeen ? 1 : 0,
                      }}
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : { duration: 0.9, delay: 0.08, ease: 'easeOut' }
                      }
                    />
                  );
                })}

              {themeMembershipEdges.map((edge) => {
                const from = fieldPointFor(edge.from);
                const to = fieldPointFor(edge.to);
                const slug = postSlugFromNode(edge.from);
                if (!from || !to || !slug) return null;
                const visible = visibleSlugs.has(slug);
                const active = edge.from === focusNodeId || edge.to === `theme:${previewThemeId}`;
                if (!active || !visible) return null;
                const curve = curveFor(from, to, edge.id);
                return (
                  <motion.path
                    key={edge.id}
                    d={curve}
                    className="post-atlas-theme-path is-active"
                    initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
                    animate={{
                      d: curve,
                      pathLength: atlasSeen ? 1 : 0,
                      opacity: atlasSeen ? 1 : 0,
                    }}
                    transition={
                      reduceMotion ? { duration: 0 } : { duration: 0.48, ease: 'easeOut' }
                    }
                  />
                );
              })}

              {postEdges.map((edge) => {
                const from = fieldPointFor(edge.from);
                const to = fieldPointFor(edge.to);
                const fromSlug = postSlugFromNode(edge.from);
                const toSlug = postSlugFromNode(edge.to);
                if (!from || !to || !fromSlug || !toSlug) return null;
                const endpointsVisible = visibleSlugs.has(fromSlug) && visibleSlugs.has(toSlug);
                const fromThemeId = postBySlug.get(fromSlug)?.themes.primary;
                const toThemeId = postBySlug.get(toSlug)?.themes.primary;
                const active = endpointsVisible && observedEdgeIds.has(edge.id);
                const crossesThemes = fromThemeId !== toThemeId;
                if (!active) return null;
                const fromThemePoint = fromThemeId ? fieldPointFor(`theme:${fromThemeId}`) : null;
                const toThemePoint = toThemeId ? fieldPointFor(`theme:${toThemeId}`) : null;
                const curve =
                  crossesThemes && fromThemePoint && toThemePoint
                    ? bundledCurveFor(from, to, fromThemePoint, toThemePoint)
                    : curveFor(from, to, edge.id);
                const tone = fromThemeId ? themeById.get(fromThemeId)?.tone : undefined;
                return (
                  <React.Fragment key={edge.id}>
                    <motion.path
                      d={curve}
                      className={`post-atlas-relation-path is-${edge.provenance} is-active`}
                      data-tone={tone}
                      initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
                      animate={{
                        d: curve,
                        pathLength: atlasSeen ? 1 : 0,
                        opacity: atlasSeen ? 1 : 0,
                      }}
                      transition={
                        reduceMotion ? { duration: 0 } : { duration: 0.46, ease: 'easeOut' }
                      }
                    />
                    {active && (
                      <motion.path
                        d={curve}
                        className="post-atlas-relation-pulse"
                        data-tone={tone}
                        initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
                        animate={{ d: curve, pathLength: 1, opacity: 1 }}
                        transition={
                          reduceMotion
                            ? { duration: 0 }
                            : { duration: 0.58, delay: 0.08, ease: 'easeOut' }
                        }
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </svg>

            <div
              className="post-atlas-theme-layer"
              role="group"
              aria-label="Editorial themes"
              aria-describedby="post-atlas-description"
              aria-hidden={focusedPost && compactOverview ? 'true' : undefined}
            >
              {taxonomy.themes.map((theme) => {
                const point = normalizedPointFor(`theme:${theme.id}`);
                if (!point) return null;
                const selected = selectedThemeId === theme.id;
                const observed = observedSlug
                  ? observedThemeIds.has(theme.id)
                  : previewThemeId === theme.id;
                const muted = observedSlug ? !observed : Boolean(previewThemeId && !observed);
                const compactMuted = compactThemeDetail && muted;
                const offset = compactThemeDetail
                  ? selected
                    ? { x: 0, y: -0.12 }
                    : { x: 0, y: 0 }
                  : (theme.labelOffset ?? { x: 0, y: 0 });
                return (
                  <div
                    key={theme.id}
                    className={`post-atlas-theme-position${muted ? ' is-muted' : ''}${
                      compactMuted ? ' is-compact-muted' : ''
                    }${observed ? ' is-observed' : ''}`}
                    style={{
                      left: `${(point.x + offset.x) * 100}%`,
                      top: `${(point.y + offset.y) * 100}%`,
                    }}
                  >
                    <motion.div
                      className="post-atlas-node-scaler"
                      style={{ scale: inverseCameraScale }}
                    >
                      <motion.button
                        type="button"
                        className={`post-atlas-theme-node${selected ? ' is-selected' : ''}${
                          observed ? ' is-observed' : ''
                        }`}
                        data-tone={theme.tone}
                        aria-pressed={selected}
                        aria-hidden={compactMuted || undefined}
                        disabled={compactMuted || Boolean(focusedPost && compactOverview)}
                        tabIndex={
                          !compactMuted &&
                          !(focusedPost && compactOverview) &&
                          activeThemeTabId === theme.id
                            ? 0
                            : -1
                        }
                        ref={(node) => {
                          if (node) themeButtonRefs.current.set(theme.id, node);
                          else themeButtonRefs.current.delete(theme.id);
                        }}
                        onClick={() => onSelectTheme(selected ? undefined : theme.id)}
                        onMouseEnter={() => setHoveredThemeId(theme.id)}
                        onMouseLeave={() => setHoveredThemeId(undefined)}
                        onFocus={() => {
                          setKeyboardThemeId(theme.id);
                          setHoveredThemeId(theme.id);
                        }}
                        onBlur={() => setHoveredThemeId(undefined)}
                        onKeyDown={(event) => moveThemeFocus(event, theme.id)}
                        whileHover={reduceMotion ? undefined : { y: -2 }}
                        whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                      >
                        <span className="post-atlas-theme-kicker">
                          {themeCounts.get(theme.id) ?? 0} posts
                        </span>
                        <span className="post-atlas-theme-title">{theme.title}</span>
                      </motion.button>
                    </motion.div>
                  </div>
                );
              })}
            </div>

            <div
              className="post-atlas-post-layer"
              role="group"
              aria-label="Posts"
              aria-describedby="post-atlas-description"
              aria-hidden={focusedPost && compactOverview ? 'true' : undefined}
            >
              {posts.map((post, index) => {
                const point = normalizedPointFor(`post:${post.slug}`);
                if (!point) return null;
                const visible = visibleSlugs.has(post.slug);
                const selected = focusedSlug === post.slug;
                const hovered = hoveredSlug === post.slug;
                const theme = themeById.get(post.themes.primary);
                const landmark = landmarkSlugs.has(post.slug) && !compactThemeDetail;
                const themePoint = normalizedPointFor(`theme:${post.themes.primary}`);
                const landmarkLabelAbove = Boolean(
                  landmark && themePoint && point.y <= themePoint.y,
                );
                const contextNeighbor = Boolean(
                  observedSlug && observedSlugs.has(post.slug) && post.slug !== observedSlug,
                );
                const mutedByObservation = Boolean(
                  observedSlug && !observedSlugs.has(post.slug) && !hovered,
                );
                const mutedByTheme = Boolean(
                  previewThemeId && post.themes.primary !== previewThemeId,
                );
                const inaccessibleInOverview = compactOverview && !selectedThemeId;
                const disabled =
                  !visible || inaccessibleInOverview || Boolean(focusedPost && compactOverview);
                return (
                  <div
                    key={post.slug}
                    className="post-atlas-post-position"
                    style={{ left: `${point.x * 100}%`, top: `${point.y * 100}%` }}
                  >
                    <motion.div
                      className="post-atlas-node-scaler"
                      style={{ scale: inverseCameraScale }}
                    >
                      <motion.button
                        type="button"
                        className={`post-atlas-post-node${visible ? '' : ' is-hidden'}${
                          selected ? ' is-selected' : ''
                        }${landmark ? ' is-landmark' : ''}${
                          point.x > 0.76 ? ' is-left-facing' : ''
                        }${landmarkLabelAbove ? ' is-landmark-above' : ''}${
                          mutedByObservation ? ' is-muted-by-observation' : ''
                        }${
                          mutedByTheme ? ' is-muted-by-theme' : ''
                        }${contextNeighbor ? ' is-context-neighbor' : ''}`}
                        data-tone={theme?.tone}
                        aria-label={`${post.title}. ${theme?.title ?? 'Post'}. Opens details.`}
                        aria-haspopup="dialog"
                        aria-hidden={disabled ? 'true' : undefined}
                        disabled={disabled}
                        tabIndex={!disabled && activePostTabSlug === post.slug ? 0 : -1}
                        ref={(node) => {
                          if (node) nodeButtonRefs.current.set(post.slug, node);
                          else nodeButtonRefs.current.delete(post.slug);
                        }}
                        onClick={() => (selected ? closeDossier() : onFocusPost(post.slug))}
                        onMouseEnter={() => setHoveredSlug(post.slug)}
                        onMouseLeave={() => setHoveredSlug(undefined)}
                        onFocus={() => {
                          setKeyboardPostSlug(post.slug);
                          setHoveredSlug(post.slug);
                        }}
                        onBlur={() => setHoveredSlug(undefined)}
                        onKeyDown={(event) => movePostFocus(event, post.slug)}
                        initial={reduceMotion ? false : { opacity: 0, scale: 0.6 }}
                        animate={{
                          opacity: atlasSeen
                            ? visible
                              ? mutedByObservation
                                ? 0.1
                                : mutedByTheme
                                  ? 0.2
                                  : 1
                              : 0.04
                            : 0,
                          scale: atlasSeen && selected ? 1.18 : atlasSeen ? 1 : 0.62,
                        }}
                        transition={{
                          delay: reduceMotion || !atlasSeen ? 0 : Math.min(index * 0.009, 0.36),
                          duration: 0.28,
                        }}
                        whileHover={reduceMotion || !visible ? undefined : { scale: 1.16 }}
                        whileTap={reduceMotion || !visible ? undefined : { scale: 0.95 }}
                      >
                        <span className="post-atlas-post-dot">
                          <span>{String(post.order).padStart(2, '0')}</span>
                        </span>
                        <span
                          className={`post-atlas-post-label${
                            selected || hovered ? ' is-visible' : ''
                          }${contextNeighbor ? ' is-context-visible' : ''}`}
                          aria-hidden="true"
                        >
                          {post.title}
                        </span>
                      </motion.button>
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {selectedThemeId && (
            <motion.button
              type="button"
              className="post-atlas-clearings-return"
              onClick={returnToAllThemes}
              disabled={Boolean(focusedPost && compactOverview)}
              aria-hidden={focusedPost && compactOverview ? 'true' : undefined}
              aria-label="Return to all themes"
              initial={reduceMotion ? false : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.22 }}
            >
              <span aria-hidden="true">←</span> All themes
            </motion.button>
          )}

          <div
            className="post-atlas-camera-controls"
            role="group"
            aria-label="Map view controls"
            aria-hidden={focusedPost && compactOverview ? 'true' : undefined}
          >
            <button
              type="button"
              onClick={() => zoomCamera(0.82)}
              aria-label="Zoom out"
              disabled={
                Boolean(focusedPost && compactOverview) || cameraZoom <= MIN_ATLAS_SCALE + 0.001
              }
            >
              <span aria-hidden="true">−</span>
            </button>
            <button
              type="button"
              onClick={() => moveCamera(getAutomaticCamera())}
              aria-label="Recenter map"
              disabled={Boolean(focusedPost && compactOverview)}
            >
              <span aria-hidden="true">⌖</span>
            </button>
            <button
              type="button"
              onClick={() => zoomCamera(1.22)}
              aria-label="Zoom in"
              disabled={
                Boolean(focusedPost && compactOverview) || cameraZoom >= MAX_ATLAS_SCALE - 0.001
              }
            >
              <span aria-hidden="true">+</span>
            </button>
          </div>

          <p className="sr-only" aria-live="polite">
            {focusedPost ? `Selected ${focusedPost.title}. Press Escape to close the details.` : ''}
          </p>
        </div>

        <AnimatePresence initial={false}>
          {focusedPost && compactOverview && (
            <motion.div
              key={`${focusedPost.slug}-backdrop`}
              className="post-atlas-dossier-backdrop"
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.2 }}
              onClick={closeDossier}
            />
          )}
        </AnimatePresence>

        <AnimatePresence initial={false} mode="wait">
          {focusedPost && (
            <motion.aside
              key={focusedPost.slug}
              className="post-atlas-dossier"
              initial={reduceMotion ? false : { opacity: 0, x: 30, scale: 0.985 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 18, scale: 0.99 }}
              transition={
                reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 310, damping: 32 }
              }
              role="dialog"
              aria-modal={compactOverview ? 'true' : undefined}
              aria-labelledby={`post-atlas-dossier-title-${focusedPost.slug}`}
            >
              <button
                ref={closeButtonRef}
                type="button"
                autoFocus
                className="post-atlas-dossier-close"
                onClick={closeDossier}
                aria-label="Close post details"
              >
                ×
              </button>
              <p className="post-atlas-dossier-meta">
                {themeById.get(focusedPost.themes.primary)?.title} ·{' '}
                {formatReadingMinutes(focusedPost.readingMinutes)}
              </p>
              <h3 id={`post-atlas-dossier-title-${focusedPost.slug}`}>{focusedPost.title}</h3>
              <p className="post-atlas-dossier-dek">{focusedPost.dek}</p>
              <div
                className="post-atlas-dossier-concepts"
                role="group"
                aria-label="Concepts in this post"
              >
                {focusedPost.conceptIds.slice(0, 5).map((conceptId) => (
                  <button
                    key={conceptId}
                    type="button"
                    onClick={() => selectConceptFromDossier(conceptId)}
                  >
                    {conceptById.get(conceptId)?.label ?? conceptId}
                  </button>
                ))}
              </div>
              {relatedPosts.length > 0 && (
                <div className="post-atlas-dossier-relations">
                  <p className="post-atlas-dossier-label">Related posts</p>
                  <ul>
                    {relatedPosts.map((relation) => (
                      <li key={relation.post.slug}>
                        <button
                          type="button"
                          className="post-atlas-trace-button"
                          onClick={() => onFocusPost(relation.post.slug)}
                          aria-label={`Trace connection to ${relation.post.title}`}
                        >
                          <span aria-hidden="true">↝</span>
                        </button>
                        <div>
                          <Link
                            to={`/posts/${relation.post.slug}`}
                            state={{ postsOrigin }}
                            onMouseEnter={() => onPrefetchPost?.(relation.post.slug)}
                            onFocus={() => onPrefetchPost?.(relation.post.slug)}
                          >
                            {relation.post.title}
                          </Link>
                          <p>
                            <span className="post-atlas-relation-provenance">
                              {relation.edge.provenance === 'body-link'
                                ? 'In the post'
                                : relation.edge.provenance === 'authored'
                                  ? 'Editorial'
                                  : 'Shared idea'}
                            </span>
                            {relation.reason}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <Link
                className="post-atlas-read-link"
                to={`/posts/${focusedPost.slug}`}
                state={{ postsOrigin }}
                onMouseEnter={() => onPrefetchPost?.(focusedPost.slug)}
                onFocus={() => onPrefetchPost?.(focusedPost.slug)}
                onTouchStart={() => onPrefetchPost?.(focusedPost.slug)}
              >
                Read post <span aria-hidden="true">→</span>
              </Link>
            </motion.aside>
          )}
        </AnimatePresence>
      </section>
    </MotionConfig>
  );
};

export default PostAtlasMap;
