import { useState, useEffect } from "react";
import { Star } from "lucide-react";

const formatStars = (num: number) => {
  return num >= 1000 ? `${(num / 1000).toFixed(1)}k` : num;
};

export function GitHubStars({ repo }: { repo: string }) {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    fetch(`https://api.github.com/repos/${repo}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.stargazers_count === "number") {
          setStars(data.stargazers_count);
        }
      })
      .catch(console.error);
  }, [repo]);

  if (stars === null) {
    return (
      <a
        href={`https://github.com/${repo}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-600 hover:text-gray-900 transition-colors"
      >
        GitHub
      </a>
    );
  }

  return (
    <a
      href={`https://github.com/${repo}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
    >
      <span>GitHub</span>
      <div className="flex items-center space-x-1 border rounded-md px-2 py-0.5 text-sm">
        <Star className="w-4 h-4 text-yellow-500 fill-current" />
        <span className="font-medium">{formatStars(stars)}</span>
      </div>
    </a>
  );
}
