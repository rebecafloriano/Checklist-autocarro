import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBsqQU6wFFigmpB4aSCjKVnMOAri9H4y6E",
    authDomain: "checklist-autocarro-4a5ad.firebaseapp.com",
    projectId: "checklist-autocarro-4a5ad",
    storageBucket: "checklist-autocarro-4a5ad.appspot.com",
    messagingSenderId: "693829638489",
    appId: "1:693829638489:web:6f781da538908117d31448"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.salvarChecklist = async function (dadosChecklist) {
    try {
        await addDoc(collection(db, "checklists"), {
            ...dadosChecklist,
            timestamp: serverTimestamp()
        });
        console.log("Checklist salvo no Firestore!");
    } catch (e) {
        console.error("Erro ao salvar checklist: ", e);
    }
};
