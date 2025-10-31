import { SearchOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Empty,
  Input,
  Layout,
  Row,
  Select,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  eventsAPI,
  registrationsAPI,
  venuesAPI,
} from "../../services/apiService";

const { Sider, Content } = Layout;
const { Title, Text } = Typography;
const { Meta } = Card;
const { RangePicker } = DatePicker;

const Explore = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [cityChoices, setCityChoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState({});
  const [userRegistrations, setUserRegistrations] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    dateRange: null,
    city: undefined,
    status: "all",
  });

  useEffect(() => {
    fetchEvents();
    fetchCityChoices();
    if (user?.role === "attendee") {
      fetchUserRegistrations();
    }
  }, [user]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await eventsAPI.getAll();
      // Only show published events for explore page
      const publishedEvents = response.data.filter(
        (event) => event.status === "published"
      );
      setEvents(publishedEvents);
    } catch (error) {
      message.error(
        "Failed to fetch events: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCityChoices = async () => {
    try {
      const response = await venuesAPI.getCityChoices();
      setCityChoices(response.data);
    } catch (error) {
      console.error("Failed to fetch city choices:", error);
    }
  };

  const fetchUserRegistrations = async () => {
    try {
      const response = await registrationsAPI.getMyRegistrations();
      // Only keep active registrations (not cancelled)
      const activeRegistrations = response.data.filter(
        (reg) => reg.status !== "cancelled"
      );
      setUserRegistrations(activeRegistrations);
    } catch (error) {
      console.error("Failed to fetch user registrations:", error);
    }
  };

  const isUserRegistered = (eventId) => {
    return userRegistrations.some((reg) => reg.event === eventId);
  };

  const handleRegister = async (event, e) => {
    e.stopPropagation();

    if (!user) {
      message.warning("Please login to register for events");
      navigate("/login");
      return;
    }

    setRegistering((prev) => ({ ...prev, [event.id]: true }));
    try {
      await registrationsAPI.create(event.id, {
        attendee: user.id,
        status: "confirmed",
      });
      message.success(`Successfully registered for ${event.title}`);
      // Refresh user registrations and events
      fetchUserRegistrations();
      fetchEvents();
    } catch (error) {
      message.error(
        "Failed to register: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setRegistering((prev) => ({ ...prev, [event.id]: false }));
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters({
      search: "",
      dateRange: null,
      city: undefined,
      status: "all",
    });
  };

  const filterEvents = () => {
    let filtered = [...events];

    // Apply search filter
    if (filters.search) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          event.description
            ?.toLowerCase()
            .includes(filters.search.toLowerCase())
      );
    }

    // Apply city filter
    if (filters.city) {
      filtered = filtered.filter(
        (event) => event.venue_details?.city === filters.city
      );
    }

    // Apply date range filter
    if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
      filtered = filtered.filter((event) => {
        const eventStart = dayjs(event.start_time);
        return (
          eventStart.isAfter(filters.dateRange[0]) &&
          eventStart.isBefore(filters.dateRange[1])
        );
      });
    }

    return filtered;
  };

  const filteredEvents = filterEvents();

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Layout style={{ background: "white", minHeight: "calc(100vh - 64px)" }}>
      <Sider
        width={300}
        style={{
          background: "white",
          padding: "24px",
          borderRight: "1px solid #f0f0f0",
        }}
      >
        <Title level={4}>Filters</Title>

        <div style={{ marginBottom: 24 }}>
          <Input
            placeholder="Search events"
            prefix={<SearchOutlined />}
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <Title level={5}>City</Title>
          <Select
            placeholder="Select city"
            style={{ width: "100%" }}
            value={filters.city}
            onChange={(value) => handleFilterChange("city", value)}
            allowClear
            options={cityChoices}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <Title level={5}>Date Range</Title>
          <RangePicker
            style={{ width: "100%" }}
            value={filters.dateRange}
            onChange={(value) => handleFilterChange("dateRange", value)}
          />
        </div>

        <Button
          type="primary"
          block
          onClick={handleReset}
          style={{ marginBottom: 16 }}
        >
          Reset Filters
        </Button>
      </Sider>

      <Content style={{ padding: "24px", minHeight: "100%" }}>
        <Row gutter={[24, 24]}>
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <Col xs={24} sm={12} md={8} lg={8} xl={6} key={event.id}>
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
                  actions={
                    user?.role === "attendee"
                      ? [
                          <Button
                            type="primary"
                            onClick={(e) => handleRegister(event, e)}
                            loading={registering[event.id]}
                            disabled={
                              event.registered_count >= event.capacity ||
                              isUserRegistered(event.id)
                            }
                          >
                            {event.registered_count >= event.capacity
                              ? "Full"
                              : isUserRegistered(event.id)
                              ? "Registered"
                              : "Register"}
                          </Button>,
                        ]
                      : undefined
                  }
                >
                  <Meta
                    title={event.title}
                    description={
                      <>
                        <div style={{ marginBottom: 8 }}>
                          {event.description
                            ? event.description.substring(0, 80) +
                              (event.description.length > 80 ? "..." : "")
                            : "No description available"}
                        </div>
                      </>
                    }
                  />
                  <div style={{ marginTop: 12 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      📅 {dayjs(event.start_time).format("MMM D, YYYY")}
                    </Text>
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      📍 {event.venue_details?.name || "TBA"}
                    </Text>
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      🏙️ {event.venue_details?.city || "TBA"}
                    </Text>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <Tag
                      color={
                        event.registered_count >= event.capacity
                          ? "red"
                          : "green"
                      }
                    >
                      {event.registered_count} / {event.capacity} registered
                    </Tag>
                  </div>
                </Card>
              </Col>
            ))
          ) : (
            <Col span={24}>
              <Empty
                description="No events found"
                style={{ margin: "48px 0" }}
              />
            </Col>
          )}
        </Row>
      </Content>
    </Layout>
  );
};

export default Explore;
