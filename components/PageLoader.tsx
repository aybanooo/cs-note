import { Icons } from "./icons";

export default function PageLoader({children}:{children?:React.ReactNode}) {
    return (    
        <>
        {
            children ||
            <Icons.spinner className="h-10 w-10 animate-spin ms-auto me-auto mt-10" />    
        }
        </>
    )
}