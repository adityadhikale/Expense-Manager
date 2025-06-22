import { Navigation } from "@/components/navigation"
import { HeaderLogo } from "@/components/header-logo"
import { WelcomeMsg } from "@/components/welcome-msg"
import { Filters } from "@/components/filters"
import { UserButtonWrapper } from "@/components/user-button-wrapper"
import { SettingsButton } from "@/components/settings-button"

export const Header = () => {
    return (
        <header className="bg-gradient-to-b from-[#45ad93] to-[#a4ddcf] px-4 py-8 lg:px-14 pb-36" >
            <div className="max-w-screen-2xl mx-auto" >
                <div className="w-full flex items-center justify-between mb-14" >
                    <div className="flex items-center lg:gap-x-16" >
                        <HeaderLogo />
                        <Navigation />
                    </div>
                    <div className="flex items-center gap-x-4">
                        <SettingsButton />
                        <UserButtonWrapper />
                    </div>
                </div>
                <WelcomeMsg />
                <Filters />
            </div>
        </header>
    )
}
