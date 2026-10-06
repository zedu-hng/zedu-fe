"use client";

import React, { useState } from "react";
import { ContributorsHero } from "./_components/ContributorsHero";
import { ContributorsGrid } from "./_components/ContributorsGrid";
import { ContributionTracks } from "./_components/ContributionTracks";
import { ContributionRoadmap } from "./_components/ContributionRoadmap";
import { JoinContributorModal } from "./_components/JoinContributorModal";
import { DynamicFooter } from "../_components/footer/dynamic-footer";
import { CONTRIBUTORS_LIST, Contributor, ContributionTrack } from "./_data/contributorsData";

export default function ContributorsPage() {
  const [contributors, setContributors] = useState<Contributor[]>(CONTRIBUTORS_LIST);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<string>("frontend");

  const handleOpenJoinModal = (trackId?: string) => {
    if (trackId) {
      const cleanTrack = trackId.replace("track-", "");
      setSelectedTrack(cleanTrack);
    }
    setIsModalOpen(true);
  };

  const handleAddContributor = (newContributor: Contributor) => {
    setContributors((prev) => [newContributor, ...prev]);
  };

  const handleTrackSelect = (track: ContributionTrack) => {
    handleOpenJoinModal(track.id);
  };

  return (
    <div className="space-y-12 sm:space-y-16 mt-8">
      {/* Hero Section */}
      <ContributorsHero
        onJoinClick={() => handleOpenJoinModal()}
        totalContributors={contributors.length}
      />

      {/* Directory & Wall of Fame */}
      <ContributorsGrid
        contributors={contributors}
        onNominateClick={() => handleOpenJoinModal()}
      />

      {/* Contribution Tracks */}
      <ContributionTracks onTrackSelect={handleTrackSelect} />

      {/* How to Contribute Roadmap */}
      <ContributionRoadmap />

      {/* Join / Nominate Modal */}
      <JoinContributorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultTrack={selectedTrack}
        onAddContributor={handleAddContributor}
      />

      {/* Dynamic CTA Footer */}
      <DynamicFooter
        text="Ready to Build the Future of Learning?"
        description="Join our global community of open-source contributors and create impactful tools for classrooms and cohorts worldwide."
      />
    </div>
  );
}
