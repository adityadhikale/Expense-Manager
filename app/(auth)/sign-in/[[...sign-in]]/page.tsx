import Image from "next/image";
import { AuthWrapper } from "@/components/auth-wrapper";

export default function Page() {
    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
            <div className="h-full lg:flex flex-col items-center justify-center px-4">
                <div className="text-center space-y-4 pt-16">
                    <h1 className="font-bold text-3xl text-[#2E2A47]">
                        Welcome Back!
                    </h1>
                    <p className="text-base text-[#45ad93]">
                        Log in or Create account to get back to your dashboard!
                    </p>
                </div>
                <div className="flex items-center justify-center mt-8">
                    <AuthWrapper type="sign-in" />
                </div>
            </div>
            <div className="h-full bg-[#45ad93] hidden lg:flex items-center justify-center">
                <Image src="/currency.svg" height={115} width={115} alt="Logo"/>
            </div>
        </div>
    );
}
