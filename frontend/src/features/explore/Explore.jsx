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
  Tag,
  Typography,
} from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const { Sider, Content } = Layout;
const { Title } = Typography;
const { Meta } = Card;
const { RangePicker } = DatePicker;

const Explore = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    search: "",
    dateRange: null,
    category: [],
    priceRange: "all",
    status: "all",
  });

  // Mock data - replace with actual API call
  const events = [
    {
      id: 1,
      title: "Tech Conference 2025",
      description: "Annual technology conference",
      image: "https://placehold.co/300x200?text=Tech+Conference",
      category: ["Technology", "Conference"],
      price: 299,
      status: "upcoming",
    },
    {
      id: 2,
      title: "Music Festival",
      description: "Summer music festival",
      image: "https://placehold.co/300x200?text=Music+Festival",
      category: ["Music", "Festival"],
      price: 150,
      status: "upcoming",
    },
    {
      id: 3,
      title: "Art Exhibition",
      description: "Modern art showcase",
      image: "https://placehold.co/300x200?text=Art+Exhibition",
      category: ["Art", "Exhibition"],
      price: 25,
      status: "upcoming",
    },
    {
      id: 4,
      title: "Food & Wine Festival",
      description: "Culinary experience",
      image: "https://placehold.co/300x200?text=Food+Festival",
      category: ["Food", "Festival"],
      price: 75,
      status: "upcoming",
    },
    // Add more events as needed
  ];

  const categories = [
    "Technology",
    "Music",
    "Art",
    "Food",
    "Business",
    "Sports",
    "Education",
    "Entertainment",
  ];

  const priceRanges = [
    { label: "All Prices", value: "all" },
    { label: "Free", value: "free" },
    { label: "Under $50", value: "under50" },
    { label: "$50 - $200", value: "50-200" },
    { label: "Over $200", value: "over200" },
  ];

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters({
      search: "",
      dateRange: null,
      category: [],
      priceRange: "all",
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
          event.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Apply category filter
    if (filters.category.length > 0) {
      filtered = filtered.filter((event) =>
        event.category.some((cat) => filters.category.includes(cat))
      );
    }

    // Apply price range filter
    if (filters.priceRange !== "all") {
      filtered = filtered.filter((event) => {
        switch (filters.priceRange) {
          case "free":
            return event.price === 0;
          case "under50":
            return event.price < 50;
          case "50-200":
            return event.price >= 50 && event.price <= 200;
          case "over200":
            return event.price > 200;
          default:
            return true;
        }
      });
    }

    return filtered;
  };

  const filteredEvents = filterEvents();

  return (
    <Layout style={{ background: "white", padding: "24px 0" }}>
      <Sider
        width={300}
        style={{
          background: "white",
          padding: "0 24px",
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

      <Content style={{ padding: "0 24px" }}>
        <Row gutter={[24, 24]}>
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <Col xs={24} sm={12} md={8} lg={8} xl={6} key={event.id}>
                <Card
                  hoverable
                  cover={<img alt={event.title} src={event.image} />}
                  onClick={() => navigate(`/events/${event.id}`)}
                >
                  <Meta title={event.title} description={event.description} />
                  <div style={{ marginTop: 12 }}>
                    {event.category.map((cat) => (
                      <Tag key={cat} color="blue" style={{ marginBottom: 4 }}>
                        {cat}
                      </Tag>
                    ))}
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <Tag color="green">${event.price}</Tag>
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
