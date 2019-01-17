import axios from 'axios';
import { key, appID } from '../config'


export default class Search {
    constructor(query) {
        this.query = query;
    }
    
    async getResults() {
        //const proxy = 'https://api.codetabs.com/v1/proxy?quest='
        try {
            const res = await axios(`https://api.edamam.com/search?q=${this.query}&app_id=${appID}&app_key=${key}&from=0&to=30`);
            this.recipes = res.data.hits.map(index => index.recipe);
        } catch (error) {
            alert(error);
        }
    
    }
}
