// src/app/layout.js
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import NavBar from "../components/NavBar";
import {UserProvider} from "@/provider/UserProvider";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata = {
    title: "Create Next App",
    description: "Generated by create next app",
};

export default function RootLayout({children}) {
    return (
        <html lang="en">
        <body>
        <UserProvider>
            <NavBar/>
            {children}
        </UserProvider>
        </body>
        </html>
    );
}