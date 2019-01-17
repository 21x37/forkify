import axios from 'axios';
import { key, appID } from '../config'

export default class Recipe {
    constructor(id) {
        this.id = id;
    }

    async getRecipe() {
        try {
            const res = await axios(`https://api.edamam.com/search?app_id=${appID}&app_key=${key}&from=0&to=30&r=http%3A%2F%2Fwww.edamam.com%2Fontologies%2Fedamam.owl%23recipe_${this.id}`);
            this.title = res.data[0].label;
            this.author = res.data[0].source;
            this.img = res.data[0].image;
            this.url = res.data[0].url;
            this.ingredients = res.data[0].ingredients.map(a => a.text);
            //a = res.data.hits.map(index => index.recipe);
            //console.log(a)
        } catch (error) {
            alert('Something went wrong ;(')
            //console.log(error);
        }
    }

    calcTime() {

        // Assuming 15 minutes per 3 ingredients
        const numIng = this.ingredients.length;
        const periods = Math.ceil(numIng / 3);
        this.time = periods * 15;
    }

    calcServings() {
        this.servings = 4;
    }

    parseIngredients() {
        const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds'];
        const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound'];
        const units = [...unitsShort, 'kg', 'g'];
        this.ingredients 

        const newIngredients = this.ingredients.map(el => {
            // 1. Uniform Units
            let ingredient = el.toLowerCase()
            unitsLong.forEach((unit, i ) => {
                ingredient = ingredient.replace(unit, unitsShort[i]);
            });

            /// 2. Remove parenetheses
            ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');

            // 3. Parse ingredients into count, unit and ingredients
            const arrIng = ingredient.split(' ');
            const unitIndex = arrIng.findIndex(el2 => units.includes(el2));

            let objIng;
            if (unitIndex > -1) {
                // There is a unit
                // Ex. 4 1/2 cups, arrCount is [4, 1/2]
                // Ex. 4 cups, arrCount is [4]
                const arrCount = arrIng.slice(0, unitIndex); 
                let count;
                if (arrCount.length === 1) {
                    count = eval(arrIng[0].replace('-', '+'));
                } else {
                    count = eval(arrIng.slice(0, unitIndex).join('+'));
                }

                objIng = {
                    count,
                    unit: arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex + 1).join(' ')
                }

            } else if (parseInt(arrIng[0], 10)) {
                // There is no unit but 1st element is number
                objIng = {
                    count: parseInt(arrIng[0], 10),
                    unit: '',
                    ingredient: arrIng.slice(1).join(' ')
                }
            } else if (unitIndex === -1) {
                // there is no unit and no number in 1st position
                objIng = {
                    count: 1,
                    unit: '',
                    ingredient

                }
            } else {
                objIng = {
                    count: '',
                    unit: '',
                    ingredient

                }
            }
            //console.log(objIng);
            return objIng;
        })
        this.ingredients = newIngredients;
    }

    updateServings (type) {
        // Servings
        const newServings = type === 'dec' ? this.servings - 1 : this.servings + 1;

        //Ingredients
        this.ingredients.forEach(ing => {
            ing.count *= (newServings / this.servings);
        });

        this.servings = newServings
    }
}