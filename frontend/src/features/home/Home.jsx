import { Card, Carousel, Col, Row, Typography } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;
const { Meta } = Card;

const Home = () => {
  const [screenHeight, setScreenHeight] = useState(window.innerHeight);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setScreenHeight(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const carouselHeight = Math.floor(screenHeight / 2);
  const carouselWidth = Math.floor((screenHeight * 16) / 9); // 16:9 aspect ratio

  const campaigns = [
    {
      title: "Summer Music Festival",
      text: "Music+Festival+2025",
      link: "/events/1",
    },
    {
      title: "Tech Conference 2025",
      text: "Tech+Conference",
      link: "/events/2",
    },
    {
      title: "Food & Wine Expo",
      text: "Food+Wine+Expo",
      link: "/events/3",
    },
  ];

  const recommendedEvents = [
    {
      id: 1,
      title: "JavaScript Workshop",
      description: "Learn modern JavaScript development",
      image: "https://placehold.co/300x200?text=JS+Workshop",
    },
    {
      id: 2,
      title: "Yoga Retreat",
      description: "3-day mindfulness and yoga retreat",
      image: "https://placehold.co/300x200?text=Yoga+Retreat",
    },
    {
      id: 3,
      title: "Photography Exhibition",
      description: "Urban photography showcase",
      image: "https://placehold.co/300x200?text=Photo+Exhibition",
    },
    {
      id: 4,
      title: "Cooking Masterclass",
      description: "Learn from top chefs",
      image: "https://placehold.co/300x200?text=Cooking+Class",
    },
  ];

  const carouselStyle = {
    margin: "0 auto",
    minWidth: "100%",
    height: carouselHeight,
    overflow: "hidden",
    marginBottom: 32,
  };

  return (
    <div>
      {/* Campaign Carousel */}
      <Carousel autoplay style={carouselStyle}>
        {campaigns.map((campaign, index) => (
          <div
            key={index}
            onClick={() => navigate(campaign.link)}
            style={{ cursor: "pointer" }}
          >
            <img
              src={`https://placehold.co/${carouselWidth}x${carouselHeight}?text=${campaign.text}`}
              alt={campaign.title}
              style={{ width: "100%", height: "auto" }}
            />
          </div>
        ))}
      </Carousel>

      {/* Recommended Events */}
      <div style={{ padding: "0 24px" }}>
        <Title level={2} style={{ marginBottom: 24 }}>
          Recommended Events
        </Title>
        <Row gutter={[24, 24]}>
          {recommendedEvents.map((event) => (
            <Col xs={24} sm={12} md={8} lg={6} key={event.id}>
              <Card
                hoverable
                cover={<img alt={event.title} src={event.image} />}
                onClick={() => navigate(`/events/${event.id}`)}
              >
                <Meta title={event.title} description={event.description} />
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default Home;
