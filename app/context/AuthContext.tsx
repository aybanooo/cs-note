"use client"
import { createContext, useContext, useEffect, useState } from "react";
import { useAuthState, useSignInWithGoogle, SignInWithPopupHook, useSignOut, SignOutHook, } from 'react-firebase-hooks/auth'

import { auth } from "@/lib/firebase/clientApp";

const AuthContext = createContext<AuthContextValue>({
    user: undefined,
    signIn: ()=>null,
    signOut: async()=>true
})

export interface User {
    name: string,
    email: string,
    photoUrl: string
}

export interface AuthContextValue {
    user?:User,
    signIn: ()=>void
    signOut: ()=>Promise<boolean>
}

export const AuthContextProvider =  ({children}:{children:React.ReactNode}) => {

    const [user, loading, error] = useAuthState(auth);
    const [signInWithGoogle, gUser, gLoading, gError] = useSignInWithGoogle(auth);
    const [firebaseSignOut] = useSignOut(auth);
    
    function signIn() {
        signInWithGoogle()
    }

    async function signOut() {
        return firebaseSignOut()
    }
    return (
        <AuthContext.Provider value={{
            user: (user ? {
                name: user.displayName || "",
                email: user.email || "",
                photoUrl: user?.photoURL || ""
            }: undefined),
            signIn: signIn,
            signOut: signOut
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const UserAuth = () => {
    return useContext(AuthContext)
}