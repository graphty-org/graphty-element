declare module "ngraph.random" {
    export interface RandomAPI {
        (seed?: number): () => number;
        random: (seed?: number) => () => number;
        ngraphRandom: (seed?: number) => () => number;
    }

    const random: RandomAPI;
    export default random;
}
