"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Search({ small }) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (event) => {
    event.preventDefault();
    if (query) {
      router.push(`/search?query=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className={`w-full ${small ? "block" : "lg:block hidden"}`}>
      <form onSubmit={handleSearch} className="w-full">
        <input
          type="text"
          className="w-full"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>
    </div>
  );
}

Search.defaultProps = {
  small: false,
};
