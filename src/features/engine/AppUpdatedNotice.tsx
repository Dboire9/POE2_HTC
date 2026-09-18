import React from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

/**
 * "The site changed under this tab — reload."
 *
 * Shown instead of an error when a solve fails because the tab is older than the live site
 * (`AppUpdated`, engineClient.ts). That is not something the player did or can fix any other way, so
 * the card says what happened in their terms, offers the one action that works, and says what it costs
 * them — nothing: every change to the workspace is written to this browser's storage as it happens
 * (`setWorkspace` → `persist`), so the reload brings the craft back.
 *
 * Deliberately NOT styled as an error. Nothing broke; a newer version is waiting.
 */
const AppUpdatedNotice: React.FC = () => (
  <Card className="p-4 space-y-2 border-sky-500/50 bg-sky-500/5" role="alert">
    <p className="text-sm font-medium">poe2htc was updated since you opened this tab</p>
    <p className="text-sm text-muted-foreground">
      The site is updated often — the prices every morning — and this tab is still running the version
      from before, so the files it needs to plan a craft have been replaced. Reload to get the new one.
      Your targets are saved in this browser and come back with it.
    </p>
    <Button onClick={() => window.location.reload()}>Reload</Button>
  </Card>
);

export default AppUpdatedNotice;
