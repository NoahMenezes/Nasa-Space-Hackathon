import React from 'react';
import './Team.css'; // Import the new CSS file

const Team = () => {
    // Member data is kept inside the component
    const teamMembers = [
        {
            name: "Dr. Sarah Chen",
            role: "Mission Lead",
            emoji: "👩‍🚀",
            bio: "Astrophysicist with 10+ years at NASA JPL, specializing in exoplanetary atmospheric modeling."
        },
        {
            name: "Marcus Rodriguez",
            role: "Lead Engineer",
            emoji: "👨‍💻",
            bio: "Full-stack wizard specializing in space tech infrastructure and real-time data visualization."
        },
        {
            name: "Aisha Patel",
            role: "Data Scientist",
            emoji: "👩‍🔬",
            bio: "ML expert focused on turning cosmic data into predictive risk assessments for NEOs (Near-Earth Objects)."
        },
        // --- New Team Members Added Below ---
        {
            name: "Elara Vance",
            role: "Comms Specialist",
            emoji: "📡",
            bio: "Ensuring seamless data transmission and communications integrity across deep space network links."
        },
        {
            name: "Dr. Kenji Sato",
            role: "Planetary Geologist",
            emoji: "⛏️",
            bio: "Expert in procedural texture generation and visual simulation of planetary surfaces."
        },
        {
            name: "James Kim",
            role: "UI/UX Designer",
            emoji: "🎨",
            bio: "Creating stellar, aesthetic, and functional user experiences for mission-critical applications."
        }
    ];

    return (
        // The main content container is what needs to handle the scroll
        <div className="page-container team-page-wrapper">
            <div className="team-wrapper">
                <header className="team-header">
                    <h1 className="animated-title">Our Team</h1>
                    <p className="animated-desc">
                        The brilliant minds behind this cosmic journey
                    </p>
                </header>
                
                <section className="team-grid">
                    {teamMembers.map((member, index) => (
                        <div 
                            key={index} 
                            className="team-card"
                            // Hover effects are handled purely by Team.css :hover rules
                        >
                            <div className="team-avatar">{member.emoji}</div>
                            <h3 className="team-name">{member.name}</h3>
                            <div className="team-role">{member.role}</div>
                            <p className="team-bio">{member.bio}</p>
                        </div>
                    ))}
                </section>

                <div className="team-mission">
                    <h2>Our Mission</h2>
                    <p>
                        We're passionate about making space exploration data accessible to everyone. 
                        Through innovative technology and creative problem-solving, we're building 
                        tools that help humanity understand our place in the cosmos and prepare for the future of space travel.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Team;
