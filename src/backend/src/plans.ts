export interface PlanProps {
    botLimit: number;
    usageLimit: number;
}

export const plans: Record<string, PlanProps> = {
    "free": {
        botLimit: 1,
        usageLimit: 1500
    },
    "advanced": {
        botLimit: 3,
        usageLimit: 150000
    }
}
