import {Algorithm} from "./Algorithm";
// Phase 4 shortest path algorithms
import {BellmanFordAlgorithm} from "./BellmanFordAlgorithm";
// Phase 2 centrality algorithms
import {BetweennessCentralityAlgorithm} from "./BetweennessCentralityAlgorithm";
// Phase 5 traversal algorithms
import {BFSAlgorithm} from "./BFSAlgorithm";
// Phase 8 advanced algorithms
import {BipartiteMatchingAlgorithm} from "./BipartiteMatchingAlgorithm";
import {ClosenessCentralityAlgorithm} from "./ClosenessCentralityAlgorithm";
// Phase 6 component algorithms
import {ConnectedComponentsAlgorithm} from "./ConnectedComponentsAlgorithm";
// Phase 1 algorithms
import {DegreeAlgorithm} from "./DegreeAlgorithm";
import {DFSAlgorithm} from "./DFSAlgorithm";
import {DijkstraAlgorithm} from "./DijkstraAlgorithm";
import {EigenvectorCentralityAlgorithm} from "./EigenvectorCentralityAlgorithm";
import {FloydWarshallAlgorithm} from "./FloydWarshallAlgorithm";
// Phase 3 community detection algorithms
import {GirvanNewmanAlgorithm} from "./GirvanNewmanAlgorithm";
import {HITSAlgorithm} from "./HITSAlgorithm";
import {KatzCentralityAlgorithm} from "./KatzCentralityAlgorithm";
// Phase 7 minimum spanning tree algorithms
import {KruskalAlgorithm} from "./KruskalAlgorithm";
import {LabelPropagationAlgorithm} from "./LabelPropagationAlgorithm";
import {LeidenAlgorithm} from "./LeidenAlgorithm";
import {LouvainAlgorithm} from "./LouvainAlgorithm";
import {MaxFlowAlgorithm} from "./MaxFlowAlgorithm";
import {MinCutAlgorithm} from "./MinCutAlgorithm";
import {PageRankAlgorithm} from "./PageRankAlgorithm";
import {PrimAlgorithm} from "./PrimAlgorithm";
import {StronglyConnectedComponentsAlgorithm} from "./StronglyConnectedComponentsAlgorithm";

// Phase 1 registrations
Algorithm.register(DegreeAlgorithm);
Algorithm.register(DijkstraAlgorithm);
Algorithm.register(PageRankAlgorithm);
Algorithm.register(LouvainAlgorithm);

// Phase 2 centrality registrations
Algorithm.register(BetweennessCentralityAlgorithm);
Algorithm.register(ClosenessCentralityAlgorithm);
Algorithm.register(EigenvectorCentralityAlgorithm);
Algorithm.register(HITSAlgorithm);
Algorithm.register(KatzCentralityAlgorithm);

// Phase 3 community detection registrations
Algorithm.register(GirvanNewmanAlgorithm);
Algorithm.register(LeidenAlgorithm);
Algorithm.register(LabelPropagationAlgorithm);

// Phase 4 shortest path registrations
Algorithm.register(BellmanFordAlgorithm);
Algorithm.register(FloydWarshallAlgorithm);

// Phase 5 traversal registrations
Algorithm.register(BFSAlgorithm);
Algorithm.register(DFSAlgorithm);

// Phase 6 component registrations
Algorithm.register(ConnectedComponentsAlgorithm);
Algorithm.register(StronglyConnectedComponentsAlgorithm);

// Phase 7 minimum spanning tree registrations
Algorithm.register(KruskalAlgorithm);
Algorithm.register(PrimAlgorithm);

// Phase 8 advanced algorithm registrations
Algorithm.register(BipartiteMatchingAlgorithm);
Algorithm.register(MaxFlowAlgorithm);
Algorithm.register(MinCutAlgorithm);
