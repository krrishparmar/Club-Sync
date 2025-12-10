import { AppState } from "../types";

export const generateClubInsights = async (data: AppState): Promise<string> => {
  // Simulating API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  return `
### 🚀 AI Insights (Demo Mode)

*   **Member Engagement**: 85% of members attended the last workshop, indicating high interest in technical topics.
*   **Task Velocity**: Team is clearing tasks 20% faster than last month, but backlog is growing.
*   **Attendance Pattern**: Consistently low attendance from first-year members on Fridays.

**Recommendation**: Consider moving Friday sessions to Wednesday afternoons to accommodate first-year schedules.
  `;
};