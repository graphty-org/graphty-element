import {Algorithm} from "./Algorithm";
import {DegreeAlgorithm} from "./DegreeAlgorithm";
import {DijkstraAlgorithm} from "./DijkstraAlgorithm";
import {LouvainAlgorithm} from "./LouvainAlgorithm";
import {PageRankAlgorithm} from "./PageRankAlgorithm";

Algorithm.register(DegreeAlgorithm);
Algorithm.register(DijkstraAlgorithm);
Algorithm.register(PageRankAlgorithm);
Algorithm.register(LouvainAlgorithm);
