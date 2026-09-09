import React from 'react';
import type { PatchData } from '../../../packages/engine/src/types.ts';
import type { ImportedItem } from '../../lib/engineTypes';
import PasteItem from './PasteItem';
import StreamerGear from './StreamerGear';

/**
 * The two ways to fill the Item tab from an item that already exists.
 *
 * One concept, so one place: both hand back an `ImportedItem` through the SAME callback, and the tab
 * cannot end up treating "the item I hold" and "the item a streamer holds" as different kinds of
 * thing. It also keeps `ItemActions` — already the largest component here — from growing a second
 * copy of the same five setters.
 *
 * Above the pickers, because they REPLACE them: someone holding the item should not have to find its
 * row in the base list before they can start.
 */
const ItemImport: React.FC<{ data: PatchData; onApply: (item: ImportedItem) => void }> = ({ data, onApply }) => (
  <div className="space-y-2">
    <PasteItem data={data} onApply={onApply} />
    <StreamerGear data={data} onApply={onApply} />
  </div>
);

export default ItemImport;
