/**
 * Keep the page alive when the browser translates it.
 *
 * Chrome and Edge translate a page by REPLACING its text nodes with `<font>` elements of their own. React
 * keeps references to the text nodes it rendered, so the next update that removes one, or inserts before
 * one, hands the DOM a node that is no longer a child of its parent. The DOM throws `NotFoundError`
 * ("Failed to execute 'removeChild' on 'Node'…"), and the error boundary takes the whole page down.
 *
 * Seen in production twice: 2026-09-04 (Edge, zh-CN, the loading placeholder; fixed there alone, see
 * translateSafety.test.tsx) and 2026-11-25 (Chrome translating to Chinese, opening the step-by-step routes
 * on the Plan tab). Fixing components one by one does not hold — any conditional text can do it — so this
 * guards the two DOM calls React makes: a removal of a node that is not a child, or an insertion before
 * one, is skipped with a warning instead of thrown. The workaround the React issue settled on
 * (facebook/react#11538).
 *
 * What it costs: on a translated page a piece of text React meant to remove may stay on screen in its
 * translated form until the next render of that area. A stale word beats a dead page. Untranslated pages
 * never reach the guarded branch: React only ever removes its own children.
 */
export function installTranslateGuard(proto: Node = Node.prototype): void {
  const marked = proto as Node & { __translateGuard?: true };
  if (marked.__translateGuard) return;
  marked.__translateGuard = true;

  // Read off the descriptor rather than `proto.removeChild`: the original is only ever called back with
  // `.call(this, …)`, never detached from a node.
  const removeChild = methodOf<Node['removeChild']>(proto, 'removeChild');
  proto.removeChild = function guardedRemoveChild<T extends Node>(this: Node, child: T): T {
    if (child.parentNode !== this) {
      console.warn('translateGuard: skipped removing a node that is not a child (page translated?)', child);
      return child;
    }
    return removeChild.call(this, child) as T;
  };

  const insertBefore = methodOf<Node['insertBefore']>(proto, 'insertBefore');
  proto.insertBefore = function guardedInsertBefore<T extends Node>(this: Node, node: T, ref: Node | null): T {
    if (ref && ref.parentNode !== this) {
      console.warn('translateGuard: skipped inserting before a node that is not a child (page translated?)', ref);
      return node;
    }
    return insertBefore.call(this, node, ref) as T;
  };
}

/** The prototype's own method, found up the chain, as a plain function value. */
function methodOf<F>(proto: object, name: string): F {
  for (let p: object | null = proto; p; p = Object.getPrototypeOf(p) as object | null) {
    const d = Object.getOwnPropertyDescriptor(p, name);
    if (d) return d.value as F;
  }
  throw new Error(`translateGuard: no ${name} on the prototype`);
}
