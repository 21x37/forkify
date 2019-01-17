import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import { elements, renderLoader, clearLoader } from './views/base';
import { basename } from 'path';

// https://www.food2fork.com/api/search
/* Global state of the app 
* - Search object
* - Current recipe object
* - Shopping list object
* - Linked recipes
*/
const state = {};

/*
Search Controller
*/
const controlSearch = async () => {
    // 1. Get query
    const query = searchView.getInput();

    if (query) {
        // 2. New search object add to state
        state.search = new Search(query);

        // 3. Prepare UI for the results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try {
        // 4. Search for recipes
        await state.search.getResults();

        // 5. Render results on UI
        clearLoader();
        searchView.renderResults(state.search.recipes);
        } catch (error) {
            alert('Something went wrong with the search');
            clearLoader();
        }

    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});


elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    console.log(btn);
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.recipes, goToPage);
        console.log(goToPage)
    }
});

/*
Recipe controller
*/
const controlRecipe = async () => {
    // Get ID from url
    const id = window.location.hash.replace('#', '');

    if (id) {
        //Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        //Highlight seleced search item
        
        if (state.search) searchView.highlightSelected(id);
        // Create new recipe object
        state.recipe = new Recipe(id);
        
        
        try {
        //Get recipe data and parse ingredients
        await state.recipe.getRecipe();
        //console.log(state.recipe.ingredients);
        state.recipe.parseIngredients()

        // Calculate servings
        state.recipe.calcTime();
        state.recipe.calcServings();

        // Render recipe
        clearLoader();
        recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));

        } catch (error) {
            alert('Error processing recipe');
        }

    }
}


['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

/*
* LIST CONTROLLER
*/

const controlList = () => {
    // Create a new list if there is none yet
    if (!state.list) state.list = new List();

    // Add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
}

// Handle delete and update list item events
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    // Handle the delete button
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        // Delete from state
        state.list.deleteItem(id);

        // Delete from UI
        listView.deleteItem(id);

        // Handle the count update
    } else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
});

/*
* LIKE CONTROLLER
*/
const controlLike = () => {
    if (!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;
    
    //User has NOT yet liked current recipe
    if (!state.likes.isLiked(currentID)) {
        // Add like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );
        // Toggle the like button
        likesView.toggleLikeBtn(true);

        //Add like to UI list
        likesView.renderLike(newLike);
        console.log(state.likes);
    
    //User HAS liked current recipe
    } else {
        // Remove like from the staet
        state.likes.deleteLike(currentID);
        // Toggle the like button
        likesView.toggleLikeBtn(false);

        // Remove like fromm UI list
        likesView.deleteLike(currentID);
        console.log(state.likes);

    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
};

// Restore like recipes on page load
window.addEventListener('load', () => {
    state.likes = new Likes();
    // Restore likes
    state.likes.readStorage();
    // Toggle like menu button
    likesView.toggleLikeMenu(state.likes.getNumLikes());
    // Render existing likes
    state.likes.likes.forEach(like => likesView.renderLike(like));

});


// Handling recipe button clicks

elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        //Decrease button is clicked
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        // Increase button clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        // Like controller
        controlLike();
    }
});


//const r = new Recipe('4e9c524a394edf6f422e5b264bdb5d5c');
//r.getRecipe();
//console.log(r);
