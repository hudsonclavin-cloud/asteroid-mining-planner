import { renderNearZeroC3Badge } from '../../../porkchop/near-zero-c3.js';

export function NearZeroC3Badge(props: { readonly flagged: boolean } | boolean) {
  return renderNearZeroC3Badge(typeof props === 'boolean' ? props : props.flagged);
}
