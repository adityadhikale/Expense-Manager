import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

type Props = {
    children: React.ReactNode;
};

const DashboardLayout = ({ children }: Props) => {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="px-3 lg:px-14 flex-grow">
                {children}
            </main>
            <Footer />
        </div>
    );
}

export default DashboardLayout;