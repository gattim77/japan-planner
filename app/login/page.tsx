import AuthForm from '../auth-form';
import {safeReturnTo} from '@/lib/auth';
import {privateSite} from '@/lib/auth-storage';
export const dynamic='force-dynamic';
export default async function Page({searchParams}:{searchParams:Promise<{returnTo?:string}>}){const params=await searchParams;return <AuthForm mode='login' returnTo={safeReturnTo(params.returnTo)} privateSpace={privateSite()}/>;}
