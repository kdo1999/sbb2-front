"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import NavBar from "../components/NavBar";
import QuestionList from "@/components/QuestionList";

export default function Home() {
    return (<>
        <QuestionList />
        </>
    );
}