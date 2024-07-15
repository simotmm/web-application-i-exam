import {db} from "../db/db.mjs";
import BudgetSociale from "../components/BudgetSociale.mjs"

export default function BudgetSocialeDAO(){

    const BUDGET_ID = 0;
    const getBudgetSocialeQuery = "SELECT * FROM budget_sociale WHERE budgetID = ?";
    const updateBudgetSocialeQuery = "UPDATE budget_sociale set budget = ?, fase = ? WHERE budgetID = ?"
    
    this.getBudgetSociale = () => {
        return new Promise((resolve, reject) => {
            db.get(getBudgetSocialeQuery, [BUDGET_ID], (err, row) => {
                if(err){
                    reject(err);
                    return;
                }
                if(!row){
                    reject(false);
                    return;
                }
                resolve(new BudgetSociale(row.budgetID, row.budget, row.fase));
            });
        });
    };

    this.updateBudgetSociale = (budget, fase) => {
        return new Promise((resolve, reject) => {
            db.run(updateBudgetSocialeQuery, [budget, fase, BUDGET_ID], (err) => {
                if(err){
                    reject(err);
                    return;
                }
                resolve(new BudgetSociale(BUDGET_ID, budget, fase));
            });
        });
    };
}