import Planner from '../planner';
import {notFound} from 'next/navigation';
export default async function Page({params}:any){const {view}=await params;if(!['explore','itinerary','festivals','matsuri','rail','saved'].includes(view))notFound();return <Planner initialView={view}/>}
