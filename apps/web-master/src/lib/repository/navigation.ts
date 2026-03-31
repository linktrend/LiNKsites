import { payloadFind } from "@/lib/payload-client";
import { siteLocaleFilter } from "@/lib/repository/shared-filters";

export interface CmsNavItem {
  id: string;
  label: string;
  url: string;
  external?: boolean;
  children?: CmsNavItem[];
}

export interface CmsNavigation {
  id: string;
  site: string;
  locale: string;
  key: "primary" | "footer" | "secondary";
  items: CmsNavItem[];
}

type CmsNavDoc = {
  id: string;
  label?: string;
  url?: string;
  external?: boolean;
  order?: number;
  parent?: string | { id?: string } | null;
  navKey?: "primary" | "footer" | "secondary" | string;
};

const asId = (value: unknown): string | null => {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object" && value && "id" in value && typeof (value as any).id === "string") {
    return (value as any).id;
  }
  return null;
};

export const getNavigation = async ({
  siteId,
  locale,
  key,
}: {
  siteId: string;
  locale: string;
  key: CmsNavigation["key"];
}): Promise<CmsNavigation | null> => {
  const baseFilter = siteLocaleFilter(siteId, locale);
  const where = {
    and: [...baseFilter.and, { navKey: { equals: key } }],
  };

  const result = await payloadFind<CmsNavDoc>({
    collection: "navigation",
    where,
    limit: 200,
    depth: 0,
    locale,
    site: siteId,
  });

  const docs = Array.isArray(result.docs) ? result.docs : [];
  if (docs.length === 0) return null;

  // Build a tree (parent relationship).
  const nodes = new Map<string, CmsNavItem & { _order: number; _parentId: string | null }>();
  for (const doc of docs) {
    const id = String(doc.id);
    nodes.set(id, {
      id,
      label: doc.label ?? "",
      url: doc.url ?? "#",
      external: doc.external ?? false,
      children: [],
      _order: typeof doc.order === "number" ? doc.order : 0,
      _parentId: asId(doc.parent),
    });
  }

  const roots: Array<CmsNavItem & { _order: number; _parentId: string | null }> = [];
  for (const node of nodes.values()) {
    if (node._parentId && nodes.has(node._parentId)) {
      nodes.get(node._parentId)!.children!.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortTree = (items: Array<any>) => {
    items.sort((a, b) => (a._order ?? 0) - (b._order ?? 0));
    items.forEach((i) => {
      if (Array.isArray(i.children) && i.children.length) sortTree(i.children);
    });
  };
  sortTree(roots);

  // Strip internal fields.
  const strip = (items: Array<any>): CmsNavItem[] =>
    items.map((i) => ({
      id: i.id,
      label: i.label,
      url: i.url,
      external: i.external,
      children: Array.isArray(i.children) && i.children.length ? strip(i.children) : [],
    }));

  return {
    id: `${siteId}:${locale}:${key}`,
    site: siteId,
    locale,
    key,
    items: strip(roots),
  };
};
