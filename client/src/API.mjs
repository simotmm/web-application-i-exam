const SERVER_URL = "http://localhost:3001";

/*** API budgetSociale ***/
// GET budgetSociale
const getBudgetSociale = async() => {
    const response = await fetch(SERVER_URL + "/api/budgetSociale", {
        method: "GET",
        credentials: "include",
    });
    if(!response.ok)
        throw new Error("fetch di GET budgetSociale fallita.");
    return await response.json(); 
}; // await serve per aspettare il risultato di .json()
 
// PATCH budgetSociale
const patchBudgetSociale = async(budgetSociale) => {
    const response = await fetch(SERVER_URL + "/api/budgetSociale", {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(budgetSociale),
        credentials: "include"
    });
    if(!response.ok)
        throw new Error("fetch di PATCH budgetSociale fallita.");
    
    return await response.json(); 
}; // await serve per aspettare il risultato di .json()


/*** API proposte ***/
// GET proposte/:utenteID
const getProposteByUtenteID = async(utenteID) => {
    const response = await fetch(SERVER_URL + "/api/proposte/" + utenteID, {
        method: "GET",
        credentials: "include",
    });
    if(!response.ok)
        throw new Error("fetch di GET proposte/:utenteID fallita.")
    return await response.json();
}

// GET proposte
const getProposte = async() => {
    const response = await fetch(SERVER_URL + "/api/proposte", {
        method: "GET",
        credentials: "include",
    });
    if(!response.ok)
        throw new Error("fetch di GET proposte fallita.");
    
    return await response.json();
};

const getProposteFaseFinale = async() => {
    const response = await fetch(SERVER_URL + "/api/proposteFaseFinale", {
        method: "GET",
        credentials: "include",
    });
    if(!response.ok)
        throw new Error("fetch di GET proposteFaseFinale fallita.");
    return await response.json();
}

// POST proposte
const postProposta = async(proposta) => {
    const response = await fetch(SERVER_URL + "/api/proposte", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(proposta),
        credentials: "include"
    });
    if(!response.ok)
        throw new Error("fetch di POST proposte fallita.");
    return await response.json();
};

// PATCH proposte
const patchProposta = async(proposta) => {
    const response = await fetch(SERVER_URL + "/api/proposte", {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(proposta),
        credentials: "include"
    });
    if(!response.ok)
        throw new Error("fetch di PATCH proposte fallita.");
    return await response;
};

// DELETE proposte
const deleteProposta = async(propostaID) => {
    const response = await fetch(SERVER_URL + "/api/proposte/"+propostaID, {
        method: "DELETE",
        credentials: "include"
    });
    if(!response.ok)
        throw new Error("fetch di DELETE proposte fallita.");
    return true;
}


/*** API preferenze ***/
// POST preferenze
const postPreferenza = async(preferenza) => {
    const response = await fetch(SERVER_URL + "/api/preferenze", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(preferenza),
        credentials: "include"
    });
    if(!response.ok)
        throw new Error("fetch di POST preferenze fallita.");
    return await response.json();
};

// DELETE preferenze/:preferenzaID
const deletePreferenza = async(preferenza) => {
    const response = await fetch(SERVER_URL + "/api/preferenze/"+preferenza.preferenzaID, {
        method: "DELETE",
        credentials: "include"
    });
    if(!response.ok)
        throw new Error("fetch di DELETE preferenze fallita.");
    return true;  
}


/*** API utenti ***/
// POST sessions
const logIn = async (credentials) => {
    const response = await fetch(SERVER_URL + "/api/sessions", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      credentials: "include",
      body: JSON.stringify(credentials),
    });
    if(response.ok) {
        const user = await response.json();
        return user;
    }
    else {
        const errDetails = await response.text();
        throw errDetails;
    }
};

// POST nuovoUtente
const signIn = async (credentials) => {
    try {
        const response = await fetch(SERVER_URL + "/api/nuovoUtente", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(credentials),
        });

        if (response.ok) {
            const user = await response.json();
            return user;
        } else {
            const errorResponse = await response.json();
            throw new Error(errorResponse.error);
        }
    } catch (error) {
        throw error.message;
    }
};

// GET sessions/current
const getUserInfo = async () => {    
    const response = await fetch(SERVER_URL + "/api/sessions/current", {
        credentials: "include",
        method: "GET"
    });
    if(response.ok)
        return response.json(); // l'eventuale errore arriva dal server
    else
        throw response.json();
};

// DELETE sessions/current
const logOut = async() => {
    const response = await fetch(SERVER_URL + "/api/sessions/current", {
        method: "DELETE",
        credentials: "include"
    });
    if(response.ok) 
        return null;
    else
        throw(response.text());
}

const API = {getBudgetSociale, patchBudgetSociale, getProposte, getProposteByUtenteID, getProposteFaseFinale, postProposta, patchProposta, deleteProposta, postPreferenza, deletePreferenza, signIn, logIn, logOut, getUserInfo};
export default API;

