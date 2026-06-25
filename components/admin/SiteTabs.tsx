import {
  ALL_SITES_TAB,
  displaySiteTabLabel,
} from "@/lib/admin/site-tabs";
import type { SiteTabCounts } from "@/lib/types/interest-customer";

type SiteTabsProps = {
  siteTabs: SiteTabCounts;
  activeSite: string;
  onChange: (siteKey: string) => void;
};

export default function SiteTabs({
  siteTabs,
  activeSite,
  onChange,
}: SiteTabsProps) {
  return (
    <div className="overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex min-w-max gap-2">
        <button
          type="button"
          onClick={() => onChange(ALL_SITES_TAB)}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
            activeSite === ALL_SITES_TAB
              ? "bg-navy text-white"
              : "border border-navy/10 bg-white text-navy/70 hover:bg-light-gray"
          }`}
        >
          {displaySiteTabLabel(ALL_SITES_TAB)}({siteTabs.total})
        </button>

        {siteTabs.sites.map((site) => (
          <button
            key={site.site_name}
            type="button"
            onClick={() => onChange(site.site_name)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
              activeSite === site.site_name
                ? "bg-navy text-white"
                : "border border-navy/10 bg-white text-navy/70 hover:bg-light-gray"
            }`}
          >
            {displaySiteTabLabel(site.site_name)}({site.count})
          </button>
        ))}
      </div>
    </div>
  );
}
