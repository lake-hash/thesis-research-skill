export const THESIS_POLICY=Object.freeze({
 generationVersion:'3.2',
 publicScope:'source_grounded_company_analysis/1.0',
 grouping:'author_company',
 history:'append_only',
 timelinePreviewWords:40,
 proseMaxChars:500,
 openingContract:'source-backed-opening/1.4',
 timelineOpeningContract:'source-backed-timeline-opening/1.3',
 tickerStanceContract:'per-expression-ticker-stance/1.0',
 sourceFidelityContract:'source-fidelity/1.0',
 reviewContract:'source-first/1.1',
 finalPublicContract:'final-public/1.3',
 feedProjectionContract:'thesis-feed-projection/1.1',
 temporalFeedDiversityContract:'temporal-feed-opening-diversity/1.0',
 factLedgerContract:'reviewed-thesis-facts/1.0',
 runtimeContract:'thesis-runtime/1.0',
 pipelineContract:'thesis-pipeline/2.0',
 feedDirections:Object.freeze(['bullish','bearish','none'])
});

export const LEGACY_GENERATION_VERSIONS=Object.freeze(['3.0','3.1']);
export const ALL_GENERATION_VERSIONS=Object.freeze([...LEGACY_GENERATION_VERSIONS,THESIS_POLICY.generationVersion]);
