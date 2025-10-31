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
  Tag,
  Typography,
} from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const RegistrationList = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);

  // Mock data - replace with actual API call
  const registrations = [
    {
      id: 1,
      eventTitle: "Tech Conference 2025",
      eventDate: "2025-11-15",
      registrationDate: "2025-10-15",
      status: "confirmed",
      ticketType: "Regular",
      price: 299,
    },
    {
      id: 2,
      eventTitle: "Music Festival",
      eventDate: "2025-12-01",
      registrationDate: "2025-10-20",
      status: "pending",
      ticketType: "VIP",
      price: 150,
    },
    {
      id: 3,
      eventTitle: "Art Exhibition",
      eventDate: "2025-11-05",
      registrationDate: "2025-10-01",
      status: "cancelled",
      ticketType: "Regular",
      price: 25,
    },
  ];

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

  const confirmCancel = () => {
    // Add API call to cancel registration
    console.log("Cancelling registration:", selectedRegistration.id);
    setShowCancelModal(false);
    setSelectedRegistration(null);
  };

  const filteredData = registrations.filter((reg) => {
    const matchesSearch = reg.eventTitle
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === "all" || reg.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
                    actions={[
                      <Button
                        type="link"
                        key="view"
                        onClick={() =>
                          navigate(`/registrations/${registration.id}`)
                        }
                      >
                        View Details
                      </Button>,
                      registration.status !== "cancelled" && (
                        <Button
                          type="link"
                          danger
                          key="cancel"
                          onClick={() => handleCancel(registration)}
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
                          {registration.eventTitle}
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
                        <Space>
                          <CalendarOutlined /> Event Date:{" "}
                          {registration.eventDate}
                        </Space>
                        <Space>
                          <ClockCircleOutlined /> Registered:{" "}
                          {registration.registrationDate}
                        </Space>
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
      >
        <p>
          Are you sure you want to cancel your registration for "
          {selectedRegistration?.eventTitle}"?
        </p>
        <p>This action cannot be undone.</p>
      </Modal>
    </>
  );
};

export default RegistrationList;
