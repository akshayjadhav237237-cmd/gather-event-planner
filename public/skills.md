# Gather Celebration Planning Skills

Agent skill definitions for the Gather celebration planner.

## Budget Allocation (`budget-allocation`)

- **Description**: Integer currency allocation with largest-remainder rounding ensuring strict category sums plus contingency equal the total budget.
- **Supported Currencies**: INR, USD, EUR, GBP.
- **Constraints**: Integer major units only; contingency reserve dynamically adjusted based on event risk profile.

## Milestone Scheduling (`milestone-timeline`)

- **Description**: Backward scheduling from celebration date, anchoring milestones to appropriate lead times.
- **Compression**: Activates compression notices and compressed milestone cadences for horizons under 21 days.

## Vendor Evaluation (`vendor-evaluation`)

- **Description**: Comprehensive vendor category interview checklists, deposit tracking, and all-in quote calculators factoring in taxes and gratuities.

## Celebration Ideation (`celebration-ideation`)

- **Description**: Personalized decor, theme concepts, and run-of-show schedules tailored to event scale and cultural traditions.
