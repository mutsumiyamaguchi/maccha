export type Ingredient = {
    name: string;
    amount: string;
}

export type Recipe = {
    name: string;
    ingredients: Ingredient[];
    steps: string[];
    time: string;
    cost: string;
    calories: string;
    key_points_for_cooking: string;
}

export type RecipeList = {
    recipes: Recipe[]
}

export const RecipeContainer = ({recipes}: RecipeList )=> {
    console.log(recipes)
    return (
        <div>
            <h1 style={{ fontSize: "2em" }}>献立</h1>
            {recipes.map((recipe, i) => (
                <li key={i}>{recipe.name}</li>
            ))}
            <br />
            <br />
            <hr />

            {recipes.map((recipe, i) => (
                <div key={i}>
                    <br />
                    <br />
                    <h2 style={{ fontSize: "1.5em" }}>{recipe.name}</h2>

                    <h3 style={{ fontSize: "1.2em" }}>【材料】</h3>
                    <table>
                        <tbody>
                        {recipe.ingredients.map((ingredient, j) => (
                            <tr key={j}>
                                <td style={{ width: "150px"}}>{ingredient.name}</td>
                                <td>{ingredient.amount}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    <br />

                    <h3 style={{ fontSize: "1.2em" }}>【作り方】</h3>
                    <ul>
                        {recipe.steps.map((step, k) => (
                            <li key={k}>{k + 1}. {step}</li>
                        ))}
                    </ul>

                    <br />

                    <h3 style={{ fontSize: "1.2em" }}>【詳細情報】</h3>
                    <table>
                        <tbody>
                            <tr><td style={{ width: "200px", verticalAlign: "top" }}>調理時間</td><td style={{ width: "500px" }}>{recipe.time}</td></tr>
                            <tr><td style={{ width: "200px", verticalAlign: "top" }}>費用</td><td style={{ width: "500px" }}>{recipe.cost}</td></tr>
                            <tr><td style={{ width: "200px", verticalAlign: "top" }}>カロリー</td><td style={{ width: "500px" }}>{recipe.calories}</td></tr>
                            <tr><td style={{ width: "200px", verticalAlign: "top" }}>調理のポイント</td><td style={{ width: "500px" }}>{recipe.key_points_for_cooking}</td></tr>
                        </tbody>
                    </table>
                    <br />
                    <br />
                    <hr />
                </div>
            ))}
        </div>
    );
}