import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import { shareUrl } from '../../lib/workspace';
import { loadEngine, priceBasis } from '../../lib/engine';

export const DISCORD_URL = 'https://discord.gg/RvxCWyFF3D';
export const ISSUES_URL = 'https://github.com/Dboire9/POE2_HTC/issues/new';

/**
 * "Report a problem" — a report the user can paste anywhere, with the craft attached.
 *
 * Feedback about a crafting planner is close to useless without the craft: "the plan looked wrong"
 * costs a round trip to find out which base, which mods, which tiers. The app already encodes the
 * entire workspace into a link (the Copy-link button), so the report carries one and a maintainer can
 * reproduce the exact state in a click.
 *
 * It is a COPYABLE BLOCK rather than a prefilled `issues/new?body=…` URL, deliberately: most players
 * have no GitHub account, and the same text works in Discord. It also means the report's length stops
 * mattering, which a URL's would not.
 *
 * NOT A MODAL. There is no dialog primitive in this project and nothing else here renders one, so a
 * modal would mean hand-rolling focus trapping, escape handling and aria-modal — a real accessibility
 * surface for no benefit. This is a plain disclosure: `aria-expanded` + `aria-controls`, no focus trap.
 *
 * Nothing is collected and nothing is sent. Every line — including the user agent — is visible in the
 * box before they copy it, and they paste it themselves.
 */
const PANEL_ID = 'report-problem-panel';

/** Build the report body. `basis` is omitted when the engine hasn't loaded — guessing a patch would
 *  be worse than leaving the line out, since a wrong patch sends a maintainer down the wrong path. */
export function reportBody(
  version: string, url: string, userAgent: string, basis?: { patch?: string; asOf?: string },
): string {
  const build = [
    `POE2HTC v${version}`,
    basis?.patch ? `patch ${basis.patch}` : null,
    basis?.asOf ? `prices as of ${basis.asOf}` : null,
  ].filter(Boolean).join(' · ');
  return [
    '**What happened:**',
    '',
    '**What I expected:**',
    '',
    '---',
    build,
    `Workspace: ${url}`,
    `Browser: ${userAgent}`,
  ].join('\n');
}

const ReportProblem: React.FC<{ version: string; open: boolean; onClose: () => void }> = ({
  version, open, onClose,
}) => {
  const [basis, setBasis] = useState<{ patch?: string; asOf?: string } | undefined>(undefined);
  const [body, setBody] = useState('');

  useEffect(() => {
    if (!open) return;
    // Composed on OPEN, not on render: the workspace changes as the user works, and a report built
    // early would describe a craft they have since moved on from.
    setBody(reportBody(version, shareUrl(), navigator.userAgent, basis));
  }, [open, version, basis]);

  useEffect(() => {
    if (!open || basis) return;
    // `loadEngine` is memoized and EngineLab has already awaited it, so this is free in practice. If it
    // somehow hasn't loaded, the report simply omits the patch line.
    let live = true;
    loadEngine()
      .then((eng) => { if (live) setBasis(priceBasis(eng)); })
      .catch(() => { /* no provenance line; the rest of the report is still worth sending */ });
    return () => { live = false; };
  }, [open, basis]);

  if (!open) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(body);
      toast.success('Report copied', { description: 'Paste it into Discord or a GitHub issue.' });
    } catch {
      // Clipboard is permission-gated and unavailable over plain http on some browsers. The text is
      // already on screen and selectable, so say that rather than failing silently.
      toast.message('Copy it from the box', { description: 'Your browser blocked clipboard access.' });
    }
  };

  return (
    <Card id={PANEL_ID} className="p-4 space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-bold">Report a problem</h2>
        <button
          onClick={onClose}
          className="text-xs text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          Close
        </button>
      </div>
      <p className="text-[11px] text-muted-foreground">
        Fill in the two lines, copy, and paste it wherever suits you. The <strong>Workspace</strong> link
        reproduces the exact base, mods and tiers you are looking at, which is usually the whole
        difference between a bug that gets fixed and one that doesn’t. Nothing is sent from here.
      </p>
      <textarea
        readOnly
        value={body}
        rows={9}
        aria-label="Problem report — copy this and paste it into Discord or GitHub"
        className="w-full rounded-md border border-input bg-background p-2 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={copy} size="sm">Copy report</Button>
        <a
          href={DISCORD_URL} target="_blank" rel="noopener noreferrer"
          className="text-xs underline text-muted-foreground hover:text-foreground"
        >
          Paste in Discord
        </a>
        <a
          href={ISSUES_URL} target="_blank" rel="noopener noreferrer"
          className="text-xs underline text-muted-foreground hover:text-foreground"
        >
          Open a GitHub issue
        </a>
        <span className="text-[11px] text-muted-foreground">— Discord needs no account.</span>
      </div>
    </Card>
  );
};

export { PANEL_ID };
export default ReportProblem;
