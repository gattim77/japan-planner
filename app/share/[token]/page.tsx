import Planner from '../../planner';
export default async function Shared({params}:any){const {token}=await params;return <Planner initialView="itinerary" shareToken={token}/>}
