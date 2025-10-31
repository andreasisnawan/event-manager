import {
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Row,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  eventsAPI,
  registrationsAPI,
  sessionsAPI,
  tracksAPI,
} from "../../services/apiService";

const { Title, Paragraph, Text } = Typography;

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [userRegistrations, setUserRegistrations] = useState([]);

  useEffect(() => {
    fetchEventDetails();
    fetchSessions();
    fetchTracks();
    if (user?.role === "attendee") {
      fetchUserRegistrations();
    }
  }, [id, user]);

  const fetchEventDetails = async () => {
    setLoading(true);
    try {
      const response = await eventsAPI.getById(id);
      const eventData = response.data;

      // Attendees should only be able to view published events
      if (user?.role === "attendee" && eventData.status !== "published") {
        message.warning("This event is not available");
        navigate("/explore");
        return;
      }

      setEvent(eventData);
    } catch (error) {
      message.error(
        "Failed to fetch event details: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await sessionsAPI.getAll(id);
      setSessions(response.data);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    }
  };

  const fetchTracks = async () => {
    try {
      const response = await tracksAPI.getAll(id);
      setTracks(response.data);
    } catch (error) {
      console.error("Failed to fetch tracks:", error);
    }
  };

  const fetchUserRegistrations = async () => {
    try {
      const response = await registrationsAPI.getMyRegistrations();
      const activeRegistrations = response.data.filter(
        (reg) => reg.status !== "cancelled"
      );
      setUserRegistrations(activeRegistrations);
    } catch (error) {
      console.error("Failed to fetch user registrations:", error);
    }
  };

  const isUserRegistered = () => {
    return userRegistrations.some(
      (reg) => reg.event === parseInt(id) || reg.event === id
    );
  };

  const handleRegister = async () => {
    if (!user) {
      message.warning("Please login to register for events");
      navigate("/login");
      return;
    }

    if (isUserRegistered()) {
      message.info("You are already registered for this event");
      return;
    }

    if (isEventFull) {
      message.warning("This event is already full");
      return;
    }

    setRegistering(true);
    try {
      await registrationsAPI.create(id, {
        attendee: user.id,
        status: "confirmed",
      });
      message.success(`Successfully registered for ${event.title}`);
      // Refresh user registrations
      await fetchUserRegistrations();
      // Navigate to My Registrations
      navigate("/registrations");
    } catch (error) {
      message.error(
        "Failed to register: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setRegistering(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "published":
        return "success";
      case "draft":
        return "default";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!event) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <Title level={3}>Event not found</Title>
      </div>
    );
  }

  const isEventFull = event.registered_count >= event.capacity;
  const isRegistered = isUserRegistered();

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Event Header */}
      <Card>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={16}>
            <div style={{ marginBottom: 16 }}>
              {/* Only show status tag for organizers and admins */}
              {user?.role !== "attendee" && (
                <Tag
                  color={getStatusColor(event.status)}
                  style={{ marginBottom: 8 }}
                >
                  {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                </Tag>
              )}
              <Title
                level={2}
                style={{
                  marginBottom: 8,
                  marginTop: user?.role === "attendee" ? 0 : undefined,
                }}
              >
                {event.title}
              </Title>
              <Paragraph type="secondary">{event.description}</Paragraph>
            </div>

            <Descriptions column={1}>
              <Descriptions.Item
                label={
                  <>
                    <CalendarOutlined /> Date
                  </>
                }
              >
                {dayjs(event.start_time).format("MMM D, YYYY")} -{" "}
                {dayjs(event.end_time).format("MMM D, YYYY")}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <>
                    <ClockCircleOutlined /> Time
                  </>
                }
              >
                {dayjs(event.start_time).format("h:mm A")} -{" "}
                {dayjs(event.end_time).format("h:mm A")}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <>
                    <EnvironmentOutlined /> Venue
                  </>
                }
              >
                {event.venue_details?.name || "TBA"}
                {event.venue_details?.city && `, ${event.venue_details.city}`}
              </Descriptions.Item>
              {event.venue_details?.address && (
                <Descriptions.Item label="Address">
                  {event.venue_details.address}
                </Descriptions.Item>
              )}
              <Descriptions.Item
                label={
                  <>
                    <TeamOutlined /> Capacity
                  </>
                }
              >
                {event.registered_count} / {event.capacity} registered
                <Tag
                  color={isEventFull ? "red" : "green"}
                  style={{ marginLeft: 8 }}
                >
                  {isEventFull ? "Full" : "Available"}
                </Tag>
              </Descriptions.Item>
              {event.organizer && (
                <Descriptions.Item
                  label={
                    <>
                      <UserOutlined /> Organizer
                    </>
                  }
                >
                  {event.organizer}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Col>

          <Col xs={24} md={8}>
            <Card
              style={{ background: "#fafafa" }}
              bodyStyle={{ textAlign: "center" }}
            >
              <Title level={4}>Registration</Title>
              <Paragraph type="secondary">
                {isEventFull
                  ? "This event is full"
                  : isRegistered
                  ? "You are registered for this event"
                  : "Join this amazing event"}
              </Paragraph>
              {user?.role === "attendee" && (
                <Button
                  type="primary"
                  size="large"
                  block
                  onClick={handleRegister}
                  loading={registering}
                  disabled={isEventFull || isRegistered}
                >
                  {isEventFull
                    ? "Event Full"
                    : isRegistered
                    ? "Already Registered"
                    : "Register Now"}
                </Button>
              )}
              {!user && (
                <Button
                  type="primary"
                  size="large"
                  block
                  onClick={() => navigate("/login")}
                >
                  Login to Register
                </Button>
              )}
            </Card>
          </Col>
        </Row>
      </Card>

      <Divider />

      {/* Tracks Section */}
      {tracks.length > 0 && (
        <>
          <Title level={3}>Tracks</Title>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            {tracks.map((track) => (
              <Col xs={24} sm={12} md={8} key={track.id}>
                <Card hoverable>
                  <Title level={5}>{track.name}</Title>
                  <Paragraph type="secondary">{track.description}</Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
          <Divider />
        </>
      )}

      {/* Sessions Section */}
      {sessions.length > 0 && (
        <>
          <Title level={3}>Sessions</Title>
          <Row gutter={[16, 16]}>
            {sessions.map((session) => (
              <Col xs={24} key={session.id}>
                <Card>
                  <Row gutter={16}>
                    <Col xs={24} md={18}>
                      <Title level={5}>{session.title}</Title>
                      <Paragraph>{session.description}</Paragraph>
                      {session.speakers && session.speakers.length > 0 && (
                        <div>
                          <Text strong>Speakers: </Text>
                          {session.speakers.map((speaker, idx) => (
                            <Tag key={speaker.id} color="blue">
                              {speaker.name}
                            </Tag>
                          ))}
                        </div>
                      )}
                      {session.room && (
                        <div style={{ marginTop: 8 }}>
                          <Text type="secondary">Room: {session.room}</Text>
                        </div>
                      )}
                    </Col>
                    <Col xs={24} md={6}>
                      <div style={{ textAlign: "right" }}>
                        <div>
                          <ClockCircleOutlined />{" "}
                          {dayjs(session.start_time).format("h:mm A")}
                        </div>
                        <div>
                          <ClockCircleOutlined />{" "}
                          {dayjs(session.end_time).format("h:mm A")}
                        </div>
                        {session.track && (
                          <Tag color="purple" style={{ marginTop: 8 }}>
                            {tracks.find((t) => t.id === session.track)?.name ||
                              "Track"}
                          </Tag>
                        )}
                      </div>
                    </Col>
                  </Row>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      )}
    </div>
  );
};

export default EventDetails;
