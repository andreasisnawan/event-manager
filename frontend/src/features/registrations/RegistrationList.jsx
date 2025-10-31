import {
  CalendarOutlined,
  ClockCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Empty,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { registrationsAPI } from "../../services/apiService";

const { Title, Text } = Typography;

const RegistrationList = () => {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const response = await registrationsAPI.getMyRegistrations();
      setRegistrations(response.data);
    } catch (error) {
      message.error(
        "Failed to fetch registrations: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "success";
      case "pending":
        return "warning";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const handleCancel = (registration) => {
    setSelectedRegistration(registration);
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    setCancelling(true);
    try {
      await registrationsAPI.cancel(selectedRegistration.id);
      message.success("Registration cancelled successfully");
      setShowCancelModal(false);
      setSelectedRegistration(null);
      // Refresh the list
      fetchRegistrations();
    } catch (error) {
      message.error(
        "Failed to cancel registration: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setCancelling(false);
    }
  };

  const filteredData = registrations.filter((reg) => {
    const matchesSearch = reg.event_details?.title
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === "all" || reg.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      <div style={{ padding: "24px" }}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div>
            <Space className="w-full justify-between">
              <Title level={4} style={{ margin: 0 }}>
                My Registrations
              </Title>
              <Space>
                <Input
                  placeholder="Search events"
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 200 }}
                />
                <Select
                  style={{ width: 120 }}
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    { label: "All Status", value: "all" },
                    { label: "Confirmed", value: "confirmed" },
                    { label: "Cancelled", value: "cancelled" },
                  ]}
                />
              </Space>
            </Space>
          </div>

          {filteredData.length > 0 ? (
            <Row gutter={[24, 24]}>
              {filteredData.map((registration) => (
                <Col xs={24} sm={24} md={12} lg={8} key={registration.id}>
                  <Card
                    hoverable
                    style={{ height: "100%" }}
                    onClick={() =>
                      navigate(`/events/${registration.event_details?.id}`)
                    }
                    actions={[
                      <Button
                        type="link"
                        key="view"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/events/${registration.event_details?.id}`);
                        }}
                      >
                        View Event
                      </Button>,
                      registration.status !== "cancelled" && (
                        <Button
                          type="link"
                          danger
                          key="cancel"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancel(registration);
                          }}
                        >
                          Cancel Registration
                        </Button>
                      ),
                    ].filter(Boolean)}
                  >
                    <Space
                      direction="vertical"
                      size="middle"
                      style={{ width: "100%" }}
                    >
                      <div>
                        <Title level={5} style={{ margin: 0 }}>
                          {registration.event_details?.title || "Unknown Event"}
                        </Title>
                        <Tag
                          color={getStatusColor(registration.status)}
                          style={{ marginTop: 8 }}
                        >
                          {registration.status.charAt(0).toUpperCase() +
                            registration.status.slice(1)}
                        </Tag>
                      </div>

                      <Space direction="vertical" size="small">
                        <Text>
                          <CalendarOutlined /> Event Date:{" "}
                          {registration.event_details?.start_time
                            ? dayjs(
                                registration.event_details.start_time
                              ).format("MMM D, YYYY")
                            : "TBA"}
                        </Text>
                        <Text>
                          <ClockCircleOutlined />{" "}
                          {registration.status === "cancelled"
                            ? "Cancelled On: "
                            : "Registered: "}
                          {dayjs(
                            registration.status === "cancelled"
                              ? registration.cancelled_at
                              : registration.created_at
                          ).format("MMM D, YYYY")}
                        </Text>
                        <Text type="secondary">
                          📍{" "}
                          {registration.event_details?.venue_details?.name ||
                            "TBA"}
                        </Text>
                        <Text type="secondary">
                          🏙️{" "}
                          {registration.event_details?.venue_details?.city ||
                            "TBA"}
                        </Text>
                      </Space>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Empty
              description="No registrations found"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </Space>
      </div>

      <Modal
        title="Cancel Registration"
        open={showCancelModal}
        onOk={confirmCancel}
        onCancel={() => setShowCancelModal(false)}
        okText="Yes, Cancel Registration"
        cancelText="No, Keep Registration"
        confirmLoading={cancelling}
      >
        <p>
          Are you sure you want to cancel your registration for "
          {selectedRegistration?.event_details?.title}"?
        </p>
        <p>This action cannot be undone.</p>
      </Modal>
    </>
  );
};

export default RegistrationList;
