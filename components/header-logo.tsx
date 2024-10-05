import Link from "next/link";
import Image from "next/image";


export const HeaderLogo = () => {
    return (
        <Link href="/" >
            <div className="items-center hidden lg:flex" >
                <Image src="/currency.svg" width={40} height={40} alt="logo" />
                <p className="font-semibold text-white text-2xl ml-2.5">
                    Expense Manager
                </p>
            </div>
        </Link>
    )
}