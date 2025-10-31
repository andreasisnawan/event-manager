import { Card, Carousel, Col, message, Row, Spin, Typography } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { eventsAPI } from "../../services/apiService";

const { Title } = Typography;
const { Meta } = Card;

const Home = () => {
  const [screenHeight, setScreenHeight] = useState(window.innerHeight);
  const [recommendedEvents, setRecommendedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setScreenHeight(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchRecommendedEvents();
  }, []);

  const fetchRecommendedEvents = async () => {
    setLoading(true);
    try {
      const response = await eventsAPI.getRecommendations();
      setRecommendedEvents(response.data);
    } catch (error) {
      message.error(
        "Failed to fetch recommended events: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const carouselHeight = 400; // Fixed height for consistency

  // Static branding campaigns for carousel
  const campaigns = [
    {
      title: "Your Trusted Events Manager",
      text: "Your+Trusted+Events+Manager",
      color: "4A90E2",
    },
    {
      title: "Discover Amazing Events",
      text: "Discover+Amazing+Events",
      color: "7B68EE",
    },
    {
      title: "Connect & Experience",
      text: "Connect+%26+Experience",
      color: "50C878",
    },
  ];

  const carouselStyle = {
    width: "100%",
    height: carouselHeight,
    overflow: "hidden",
    marginBottom: 32,
  };

  return (
    <div style={{ width: "100%", overflowX: "hidden" }}>
      {/* Campaign Carousel - Static Branding */}
      <Carousel autoplay style={carouselStyle}>
        {campaigns.map((campaign, index) => (
          <div key={index}>
            <img
              src={`https://placehold.co/1200x${carouselHeight}/${campaign.color}/ffffff?text=${campaign.text}`}
              alt={campaign.title}
              style={{
                width: "100%",
                height: carouselHeight,
                objectFit: "cover",
              }}
            />
          </div>
        ))}
      </Carousel>

      {/* Recommended Events */}
      <div
        style={{ padding: "0 24px", maxWidth: "100%", boxSizing: "border-box" }}
      >
        <Title level={2} style={{ marginBottom: 24 }}>
          Recommended Events
        </Title>

        {loading ? (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Spin size="large" />
          </div>
        ) : recommendedEvents.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Typography.Text type="secondary">
              No upcoming events available at the moment.
            </Typography.Text>
          </div>
        ) : (
          <Row gutter={[24, 24]}>
            {recommendedEvents.map((event) => (
              <Col xs={24} sm={12} md={8} lg={6} key={event.id}>
                <Card
                  hoverable
                  cover={
                    <img
                      alt={event.title}
                      src={`https://placehold.co/300x200?text=${encodeURIComponent(
                        event.title
                      )}`}
                      style={{ height: 200, objectFit: "cover" }}
                    />
                  }
                  onClick={() => navigate(`/events/${event.id}`)}
                >
                  <Meta
                    title={event.title}
                    description={
                      <>
                        <div style={{ marginBottom: 8 }}>
                          {event.description
                            ? event.description.substring(0, 60) +
                              (event.description.length > 60 ? "..." : "")
                            : "No description available"}
                        </div>
                        <div style={{ fontSize: 12, color: "#666" }}>
                          {dayjs(event.start_time).format("MMM D, YYYY")}
                        </div>
                        <div style={{ fontSize: 12, color: "#666" }}>
                          {event.venue_details?.name || "TBA"}
                        </div>
                      </>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
};

export default Home;
