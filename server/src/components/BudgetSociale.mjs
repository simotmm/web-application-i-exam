export default function BudgetSociale(budgetID, budget, fase){
    this.budgetID = budgetID;
    this.budget = budget;
    this.fase = fase;

    this.toJSON = () => {
        return { ...this };
    }
}