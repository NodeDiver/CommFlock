import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { CommunitiesGrid } from "@/components/communities-grid";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "en",
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

const mockCommunities = [
  {
    id: "1",
    name: "Bitcoin Developers",
    slug: "bitcoin-devs",
    description: "A community for Bitcoin developers",
    isPublic: true,
    _count: { members: 150 },
    owner: { username: "satoshi" },
  },
  {
    id: "2",
    name: "Lightning Network",
    slug: "lightning",
    description: "Lightning Network enthusiasts",
    isPublic: true,
    _count: { members: 200 },
    owner: { username: "alice" },
  },
  {
    id: "3",
    name: "Nostr Protocol",
    slug: "nostr",
    description: "Nostr protocol discussion",
    isPublic: true,
    _count: { members: 100 },
    owner: { username: "bob" },
  },
];

describe("CommunitiesGrid Component", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe("Rendering", () => {
    it("should render initial communities", () => {
      render(
        <CommunitiesGrid
          initialCommunities={mockCommunities}
          totalCount={3}
          showSearch={true}
          showLoadMore={true}
        />,
      );

      // Check that all communities are rendered
      expect(screen.getByText("Bitcoin Developers")).toBeInTheDocument();
      expect(screen.getByText("Lightning Network")).toBeInTheDocument();
      expect(screen.getByText("Nostr Protocol")).toBeInTheDocument();
    });

    it("should render community details", () => {
      render(
        <CommunitiesGrid
          initialCommunities={[mockCommunities[0]]}
          totalCount={1}
        />,
      );

      expect(screen.getByText("Bitcoin Developers")).toBeInTheDocument();
      expect(
        screen.getByText("A community for Bitcoin developers"),
      ).toBeInTheDocument();
      expect(screen.getByText("150 members")).toBeInTheDocument();
      expect(screen.getByText("@satoshi")).toBeInTheDocument();
    });

    it("should show search input when showSearch is true", () => {
      render(
        <CommunitiesGrid
          initialCommunities={mockCommunities}
          totalCount={3}
          showSearch={true}
        />,
      );

      const searchInput = screen.getByPlaceholderText("search");
      expect(searchInput).toBeInTheDocument();
    });

    it("should hide search input when showSearch is false", () => {
      render(
        <CommunitiesGrid
          initialCommunities={mockCommunities}
          totalCount={3}
          showSearch={false}
        />,
      );

      const searchInput = screen.queryByPlaceholderText("search");
      expect(searchInput).not.toBeInTheDocument();
    });

    it("should show Load More button when showLoadMore is true and hasMore", () => {
      render(
        <CommunitiesGrid
          initialCommunities={mockCommunities}
          totalCount={10} // More than current
          showLoadMore={true}
        />,
      );

      const loadMoreButton = screen.getByText("loadMore");
      expect(loadMoreButton).toBeInTheDocument();
    });

    it("should hide Load More button when showLoadMore is false", () => {
      render(
        <CommunitiesGrid
          initialCommunities={mockCommunities}
          totalCount={10}
          showLoadMore={false}
        />,
      );

      const loadMoreButton = screen.queryByText("loadMore");
      expect(loadMoreButton).not.toBeInTheDocument();
    });

    it("should show 'all loaded' message when no more communities", () => {
      render(
        <CommunitiesGrid
          initialCommunities={mockCommunities}
          totalCount={3} // Same as loaded
          showLoadMore={true}
        />,
      );

      expect(screen.getByText("allLoaded")).toBeInTheDocument();
    });
  });

  describe("Empty State", () => {
    it("should show empty state when no communities", () => {
      render(<CommunitiesGrid initialCommunities={[]} totalCount={0} />);

      expect(screen.getByText("noCommunities")).toBeInTheDocument();
      expect(screen.getByText("createFirst")).toBeInTheDocument();
    });

    it("should not show Load More in empty state", () => {
      render(
        <CommunitiesGrid
          initialCommunities={[]}
          totalCount={0}
          showLoadMore={true}
        />,
      );

      const loadMoreButton = screen.queryByText("loadMore");
      expect(loadMoreButton).not.toBeInTheDocument();
    });
  });

  describe("Load More Functionality", () => {
    it("should load more communities when clicking Load More", async () => {
      const additionalCommunities = [
        {
          id: "4",
          name: "Ethereum Devs",
          slug: "ethereum",
          description: null,
          isPublic: true,
          _count: { members: 300 },
          owner: { username: "vitalik" },
        },
      ];

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => additionalCommunities,
      } as Response);

      render(
        <CommunitiesGrid
          initialCommunities={mockCommunities}
          totalCount={4}
          showLoadMore={true}
          loadMoreIncrement={1}
        />,
      );

      const loadMoreButton = screen.getByText("loadMore");
      fireEvent.click(loadMoreButton);

      await waitFor(() => {
        expect(screen.getByText("Ethereum Devs")).toBeInTheDocument();
      });

      // Original communities should still be there
      expect(screen.getByText("Bitcoin Developers")).toBeInTheDocument();
      expect(screen.getByText("Lightning Network")).toBeInTheDocument();
    });

    it("should append new communities to existing list", async () => {
      const newCommunities = [
        {
          id: "4",
          name: "New Community",
          slug: "new",
          description: null,
          isPublic: true,
          _count: { members: 50 },
          owner: { username: "user" },
        },
      ];

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => newCommunities,
      } as Response);

      render(
        <CommunitiesGrid
          initialCommunities={mockCommunities}
          totalCount={10}
          loadMoreIncrement={6}
        />,
      );

      const loadMoreButton = screen.getByText("loadMore");
      fireEvent.click(loadMoreButton);

      await waitFor(() => {
        expect(screen.getByText("New Community")).toBeInTheDocument();
      });

      // Check that fetch was called with correct skip/take
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/communities?skip=3&take=6",
      );
    });

    it("should show loading state while fetching", async () => {
      vi.mocked(global.fetch).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => [],
                } as Response),
              100,
            ),
          ),
      );

      render(
        <CommunitiesGrid
          initialCommunities={mockCommunities}
          totalCount={10}
        />,
      );

      const loadMoreButton = screen.getByText("loadMore");
      fireEvent.click(loadMoreButton);

      // Button should be disabled during loading
      expect(loadMoreButton).toBeDisabled();
    });

    it("should handle fetch error gracefully", async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error("Network error"));

      render(
        <CommunitiesGrid
          initialCommunities={mockCommunities}
          totalCount={10}
        />,
      );

      const loadMoreButton = screen.getByText("loadMore");
      fireEvent.click(loadMoreButton);

      await waitFor(() => {
        // Should not crash, button should be enabled again
        expect(loadMoreButton).not.toBeDisabled();
      });
    });
  });

  describe("Search Functionality", () => {
    it("should call API with search query", async () => {
      const searchResults = [mockCommunities[0]];

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => searchResults,
      } as Response);

      render(
        <CommunitiesGrid
          initialCommunities={mockCommunities}
          totalCount={3}
          showSearch={true}
        />,
      );

      const searchInput = screen.getByPlaceholderText("search");
      fireEvent.change(searchInput, { target: { value: "bitcoin" } });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/communities?search=bitcoin&skip=0&take=20",
        );
      });
    });

    it("should update communities with search results", async () => {
      const searchResults = [mockCommunities[0]];

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => searchResults,
      } as Response);

      render(
        <CommunitiesGrid
          initialCommunities={mockCommunities}
          totalCount={3}
          showSearch={true}
        />,
      );

      const searchInput = screen.getByPlaceholderText("search");
      fireEvent.change(searchInput, { target: { value: "bitcoin" } });

      await waitFor(() => {
        expect(screen.getByText("Bitcoin Developers")).toBeInTheDocument();
        expect(screen.queryByText("Lightning Network")).not.toBeInTheDocument();
      });
    });

    it("should restore initial communities when search is cleared", async () => {
      render(
        <CommunitiesGrid
          initialCommunities={mockCommunities}
          totalCount={3}
          showSearch={true}
        />,
      );

      const searchInput = screen.getByPlaceholderText("search");

      // Search for something
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => [mockCommunities[0]],
      } as Response);

      fireEvent.change(searchInput, { target: { value: "bitcoin" } });

      await waitFor(() => {
        expect(screen.queryByText("Lightning Network")).not.toBeInTheDocument();
      });

      // Clear search
      fireEvent.change(searchInput, { target: { value: "" } });

      await waitFor(() => {
        expect(screen.getByText("Bitcoin Developers")).toBeInTheDocument();
        expect(screen.getByText("Lightning Network")).toBeInTheDocument();
        expect(screen.getByText("Nostr Protocol")).toBeInTheDocument();
      });
    });

    it("should not fetch if search query is empty", () => {
      render(
        <CommunitiesGrid
          initialCommunities={mockCommunities}
          totalCount={3}
          showSearch={true}
        />,
      );

      const searchInput = screen.getByPlaceholderText("search");
      fireEvent.change(searchInput, { target: { value: "   " } });

      // Should not call fetch for whitespace-only query
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe("Props Defaults", () => {
    it("should use default loadMoreIncrement of 6", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as Response);

      render(
        <CommunitiesGrid
          initialCommunities={mockCommunities}
          totalCount={10}
        />,
      );

      const loadMoreButton = screen.getByText("loadMore");
      fireEvent.click(loadMoreButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/communities?skip=3&take=6",
        );
      });
    });

    it("should use custom loadMoreIncrement", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as Response);

      render(
        <CommunitiesGrid
          initialCommunities={mockCommunities}
          totalCount={10}
          loadMoreIncrement={10}
        />,
      );

      const loadMoreButton = screen.getByText("loadMore");
      fireEvent.click(loadMoreButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/communities?skip=3&take=10",
        );
      });
    });
  });
});
