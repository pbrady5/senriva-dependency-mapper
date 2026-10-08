# Dependency risk: worked synthetic example

**Status:** Illustrative demonstration, not a customer engagement, live HubSpot scan, or evidence of full-portal coverage.

## The change

A RevOps team proposes changing the definition of the `Lifecycle Stage` property before a pipeline migration. A workflow enrolls contacts based on that property and routes them through owner assignment and SDR notification.

## Dependency path

```text
Lifecycle Stage (property)
  -> Lead Routing (workflow enrollment)
     -> Owner Assignment (workflow action)
     -> SDR Notification (workflow action)
     -> Opportunity Routing (handoff)
```

## Evidence and uncertainty

| Relationship | Evidence in this example | Classification |
| --- | --- | --- |
| Lifecycle Stage -> Lead Routing | Fictional enrollment condition | Observed **within synthetic scenario** |
| Lead Routing -> Owner Assignment | Fictional workflow action | Observed **within synthetic scenario** |
| Lead Routing -> SDR Notification | Fictional workflow action | Observed **within synthetic scenario** |
| Owner Assignment -> Opportunity Routing | No implementation record provided | **Unverified** |

**Risk:** Editing the property or its permitted values could change enrollment and downstream routing. The scenario does not establish that any real portal has this configuration.

## Recommended validation before a real change

1. Export or capture the exact workflow enrollment and re-enrollment rules.
2. Inspect owner-assignment branches and referenced properties.
3. Check downstream notification, list, reporting, and integration consumers.
4. Confirm who owns the change and the rollback decision.
5. Test with representative, privacy-minimized records in a nonproduction environment where possible.
6. Record unresolved dependencies separately rather than treating them as verified.

## What this proves

This artifact illustrates Senriva's **evidence-first reporting approach**: scope the change, trace observed relationships, classify unknowns, and turn findings into concrete validation actions. It does **not** prove automated discovery, a completed customer audit, or end-to-end migration and rollback capabilities.

The commercial offer and current limitations are published at [senriva.com/paid-audit](https://senriva.com/paid-audit).
