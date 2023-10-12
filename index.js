import express from "express"; 
import axios from "axios";
import bodyParser from "body-parser";

const app = express(); 
const port = 3000; 
const API_URL = "https://www.dnd5eapi.co/api";

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));


let content = "Select the desired DND term to view reference information.";

app.get("/", async (req, res) => {
    try {
        const endpoints = await axios.get(API_URL);
        let endpointsList = Object.keys(endpoints.data);
        let promises = [];
        
        endpointsList.forEach((endpoint, i) => {
            promises.push(
                axios.get(API_URL + "/" + endpoint).then(response => {
                    endpointsList[i] = {
                        name: endpoint, 
                        resources: response.data.results
                    };
                })
            );
        });
        Promise.all(promises).then(() => 
            res.render("index.ejs", { endpointsList: endpointsList, content: content })
        );
    } catch (e) {
        console.error(e.response.data);
        res.sendStatus(500);
    }
})

app.post("/ability-scores", async (req, res) => {
    try {
        const result = await axios.get(API_URL + "/ability-scores/" + req.body["ability-scores"]);
        content = result.data;
        res.redirect("/");
    } catch (e) {
        console.error(e.response.data);
        res.sendStatus(500);
    }
})

app.post("/*", async (req, res) => {
    const path = req.originalUrl;
    try {
        const result = await axios.get(API_URL + path + "/" + req.body[path.slice(1)]);
        content = JSON.stringify(result.data, null, 2);
        res.redirect("/")
    } catch (e) {
        console.error(e.response.data);
        res.sendStatus(500);
    }
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})