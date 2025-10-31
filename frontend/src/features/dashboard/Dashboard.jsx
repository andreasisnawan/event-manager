import {
  BankOutlined,
  CalendarOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Button,
  DatePicker,
  Form,
  Input,
  Layout,
  Menu,
  message,
  Modal,
  Segmented,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import {
  eventsAPI,
  speakersAPI,
  tracksAPI,
  venuesAPI,
} from "../../services/apiService";

const { RangePicker } = DatePicker;
const { Title } = Typography;
const { Sider, Content } = Layout;

const Dashboard = () => {
  const [selectedMenu, setSelectedMenu] = useState("events");
  const [activeEventTab, setActiveEventTab] = useState("events");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("create");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [form] = Form.useForm();
  const [speakers, setSpeakers] = useState([]);
  const [venues, setVenues] = useState([]);
  const [cityChoices, setCityChoices] = useState([]);
  const [events, setEvents] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch data based on selected menu
  useEffect(() => {
    if (selectedMenu === "speakers") {
      fetchSpeakers();
    } else if (selectedMenu === "venues") {
      fetchVenues();
      fetchCityChoices();
    } else if (selectedMenu === "events") {
      if (activeEventTab === "events") {
        fetchEvents();
      } else if (activeEventTab === "tracks") {
        fetchEvents(); // Need events for tracks
      }
    }
  }, [selectedMenu, activeEventTab]);

  const fetchSpeakers = async () => {
    setLoading(true);
    try {
      const response = await speakersAPI.getAll();
      setSpeakers(response.data);
    } catch (error) {
      message.error(
        "Failed to fetch speakers: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchVenues = async () => {
    setLoading(true);
    try {
      const response = await venuesAPI.getAll();
      setVenues(response.data);
    } catch (error) {
      message.error(
        "Failed to fetch venues: " +
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
      message.error(
        "Failed to fetch city choices: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await eventsAPI.getAll();
      setEvents(response.data);
      // Set first event as default for tracks if available
      if (response.data.length > 0 && !selectedEventId) {
        setSelectedEventId(response.data[0].id);
      }
    } catch (error) {
      message.error(
        "Failed to fetch events: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchTracks = async (eventId) => {
    if (!eventId) return;

    setLoading(true);
    try {
      const response = await tracksAPI.getAll(eventId);
      setTracks(response.data);
    } catch (error) {
      message.error(
        "Failed to fetch tracks: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch tracks when event is selected
  useEffect(() => {
    if (activeEventTab === "tracks" && selectedEventId) {
      fetchTracks(selectedEventId);
    }
  }, [selectedEventId, activeEventTab]);

  // Mock data - replace with API calls

  const sessions = [
    {
      id: 1,
      eventId: 1,
      title: "Keynote Speech",
      description: "Opening keynote",
      startTime: "2025-11-15 09:00",
      endTime: "2025-11-15 10:30",
      trackId: 1,
      speaker: "John Doe",
    },
  ];

  const handleCreate = () => {
    setModalType("create");
    setSelectedRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setModalType("edit");
    setSelectedRecord(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: "Are you sure you want to delete this item?",
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "No, Cancel",
      onOk: async () => {
        try {
          if (selectedMenu === "speakers") {
            await speakersAPI.delete(record.id);
            message.success("Speaker deleted successfully");
            fetchSpeakers();
          } else if (selectedMenu === "venues") {
            await venuesAPI.delete(record.id);
            message.success("Venue deleted successfully");
            fetchVenues();
          } else if (activeEventTab === "tracks" && selectedEventId) {
            await tracksAPI.delete(selectedEventId, record.id);
            message.success("Track deleted successfully");
            fetchTracks(selectedEventId);
          } else {
            // Add API calls for other resources
            message.success("Item deleted successfully");
          }
        } catch (error) {
          message.error(
            "Failed to delete: " +
              (error.response?.data?.message || error.message)
          );
        }
      },
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      if (selectedMenu === "speakers") {
        // Handle speaker creation/update
        const speakerData = {
          name: values.name,
          bio: values.bio || "",
          avatar_url: values.avatar_url || "",
          contact_email: values.contact_email || "",
          metadata: values.metadata || {},
        };

        if (modalType === "create") {
          await speakersAPI.create(speakerData);
          message.success("Speaker created successfully");
        } else {
          await speakersAPI.update(selectedRecord.id, speakerData);
          message.success("Speaker updated successfully");
        }

        fetchSpeakers();
      } else if (selectedMenu === "venues") {
        // Handle venue creation/update
        const venueData = {
          name: values.name,
          address: values.address || "",
          city: values.city || "",
          capacity: values.capacity ? parseInt(values.capacity, 10) : null,
          metadata: values.metadata || {},
        };

        if (modalType === "create") {
          await venuesAPI.create(venueData);
          message.success("Venue created successfully");
        } else {
          await venuesAPI.update(selectedRecord.id, venueData);
          message.success("Venue updated successfully");
        }

        fetchVenues();
      } else if (activeEventTab === "tracks" && selectedEventId) {
        // Handle track creation/update
        const trackData = {
          name: values.name,
          description: values.description || "",
        };

        if (modalType === "create") {
          await tracksAPI.create(selectedEventId, trackData);
          message.success("Track created successfully");
        } else {
          await tracksAPI.update(selectedEventId, selectedRecord.id, trackData);
          message.success("Track updated successfully");
        }

        fetchTracks(selectedEventId);
      } else {
        // Handle other resources
        console.log("Form values:", values);
        message.success(
          `Item ${modalType === "create" ? "created" : "updated"} successfully`
        );
      }

      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      if (error.errorFields) {
        // Validation errors
        return;
      }
      message.error(
        "Operation failed: " + (error.response?.data?.message || error.message)
      );
    }
  };

  const eventsColumns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Date Range",
      dataIndex: "startDate",
      key: "dateRange",
      render: (_, record) => (
        <span>
          {record.startDate} to {record.endDate}
        </span>
      ),
    },
    {
      title: "Venue",
      dataIndex: "venue",
      key: "venue",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "upcoming" ? "green" : "blue"}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  const sessionsColumns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Time",
      dataIndex: "startTime",
      key: "time",
      render: (_, record) => (
        <span>
          {record.startTime} - {record.endTime}
        </span>
      ),
    },
    {
      title: "Speaker",
      dataIndex: "speaker",
      key: "speaker",
    },
    {
      title: "Track",
      dataIndex: "trackId",
      key: "track",
      render: (trackId) => {
        const track = tracks.find((t) => t.id === trackId);
        return track ? track.name : "-";
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  const venuesColumns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      ellipsis: true,
    },
    {
      title: "City",
      dataIndex: "city",
      key: "city",
    },
    {
      title: "Capacity",
      dataIndex: "capacity",
      key: "capacity",
      render: (capacity) =>
        capacity ? `${capacity.toLocaleString()} people` : "-",
    },
    {
      title: "Created",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => (date ? new Date(date).toLocaleDateString() : "-"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  const speakersColumns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (_, record) => (
        <Space>
          {record.avatar_url ? (
            <img
              src={record.avatar_url}
              alt={record.name}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                backgroundColor: "#f0f0f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <UserOutlined />
            </div>
          )}
          {record.name}
        </Space>
      ),
    },
    {
      title: "Email",
      dataIndex: "contact_email",
      key: "contact_email",
    },
    {
      title: "Bio",
      dataIndex: "bio",
      key: "bio",
      ellipsis: true,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  const tracksColumns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Event",
      dataIndex: "event",
      key: "event",
      render: (eventId) => {
        const event = events.find((e) => e.id === eventId);
        return event ? event.title : "-";
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  const getModalForm = () => {
    switch (selectedMenu === "events" ? activeEventTab : selectedMenu) {
      case "events":
        return (
          <>
            <Form.Item
              name="title"
              label="Title"
              rules={[
                { required: true, message: "Please enter the event title" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="description"
              label="Description"
              rules={[
                { required: true, message: "Please enter a description" },
              ]}
            >
              <Input.TextArea />
            </Form.Item>
            <Form.Item
              name="dateRange"
              label="Date Range"
              rules={[
                { required: true, message: "Please select the date range" },
              ]}
            >
              <RangePicker />
            </Form.Item>
            <Form.Item
              name="venue"
              label="Venue"
              rules={[{ required: true, message: "Please enter the venue" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: "Please select the status" }]}
            >
              <Select>
                <Select.Option value="upcoming">Upcoming</Select.Option>
                <Select.Option value="ongoing">Ongoing</Select.Option>
                <Select.Option value="completed">Completed</Select.Option>
              </Select>
            </Form.Item>
          </>
        );

      case "sessions":
        return (
          <>
            <Form.Item
              name="title"
              label="Title"
              rules={[
                { required: true, message: "Please enter the session title" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="description"
              label="Description"
              rules={[
                { required: true, message: "Please enter a description" },
              ]}
            >
              <Input.TextArea />
            </Form.Item>
            <Form.Item
              name="timeRange"
              label="Time Range"
              rules={[
                { required: true, message: "Please select the time range" },
              ]}
            >
              <RangePicker showTime />
            </Form.Item>
            <Form.Item
              name="speaker"
              label="Speaker"
              rules={[
                { required: true, message: "Please enter the speaker name" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="trackId"
              label="Track"
              rules={[{ required: true, message: "Please select a track" }]}
            >
              <Select>
                {tracks.map((track) => (
                  <Select.Option key={track.id} value={track.id}>
                    {track.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </>
        );

      case "tracks":
        return (
          <>
            <Form.Item
              name="name"
              label="Name"
              rules={[
                { required: true, message: "Please enter the track name" },
              ]}
            >
              <Input placeholder="Main Track" />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <Input.TextArea
                rows={3}
                placeholder="Description of the track..."
              />
            </Form.Item>
          </>
        );
      case "venues":
        return (
          <>
            <Form.Item
              name="name"
              label="Name"
              rules={[
                { required: true, message: "Please enter the venue name" },
              ]}
            >
              <Input placeholder="Convention Center" />
            </Form.Item>
            <Form.Item name="address" label="Address">
              <Input.TextArea
                rows={2}
                placeholder="123 Main Street, Building A"
              />
            </Form.Item>
            <Form.Item name="city" label="City">
              <Select
                placeholder="Select a city"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
                loading={cityChoices.length === 0}
              >
                {cityChoices.map((city) => (
                  <Select.Option key={city.value} value={city.value}>
                    {city.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="capacity" label="Capacity">
              <Input
                type="number"
                min={0}
                placeholder="Maximum number of attendees"
              />
            </Form.Item>
          </>
        );
      case "speakers":
        return (
          <>
            <Form.Item
              name="name"
              label="Name"
              rules={[
                { required: true, message: "Please enter the speaker name" },
              ]}
            >
              <Input placeholder="John Doe" />
            </Form.Item>
            <Form.Item
              name="contact_email"
              label="Contact Email"
              rules={[{ type: "email", message: "Please enter a valid email" }]}
            >
              <Input placeholder="john.doe@example.com" />
            </Form.Item>
            <Form.Item
              name="avatar_url"
              label="Avatar URL"
              rules={[{ type: "url", message: "Please enter a valid URL" }]}
            >
              <Input placeholder="https://example.com/avatar.jpg" />
            </Form.Item>
            <Form.Item name="bio" label="Bio">
              <Input.TextArea
                rows={4}
                placeholder="Brief biography of the speaker..."
              />
            </Form.Item>
          </>
        );
    }
  };

  const getTableData = () => {
    switch (selectedMenu === "events" ? activeEventTab : selectedMenu) {
      case "events":
        return { columns: eventsColumns, data: events };
      case "sessions":
        return { columns: sessionsColumns, data: sessions };
      case "tracks":
        return { columns: tracksColumns, data: tracks };
      case "venues":
        return { columns: venuesColumns, data: venues };
      case "speakers":
        return { columns: speakersColumns, data: speakers };
    }
  };

  const { columns, data } = getTableData();

  const menuItems = [
    {
      key: "events",
      icon: <CalendarOutlined />,
      label: "Events",
    },
    {
      key: "venues",
      icon: <BankOutlined />,
      label: "Venues",
    },
    {
      key: "speakers",
      icon: <UserOutlined />,
      label: "Speakers",
    },
  ];

  const eventSegments = [
    { value: "events", label: "Events" },
    { value: "sessions", label: "Sessions" },
    { value: "tracks", label: "Tracks" },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider theme="light" width={220} style={{ padding: "24px 0" }}>
        <Menu
          mode="inline"
          selectedKeys={[selectedMenu]}
          items={menuItems}
          onClick={({ key }) => setSelectedMenu(key)}
        />
      </Sider>
      <Layout className="p-3">
        <Content className="bg-white p-5 rounded">
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <div className="pt-7">
              <Space style={{ width: "100%", justifyContent: "space-between" }}>
                {selectedMenu === "events" ? (
                  <Segmented
                    options={eventSegments}
                    onChange={setActiveEventTab}
                  />
                ) : (
                  <Title level={4} style={{ margin: 0 }}>
                    {menuItems.find((item) => item.key === selectedMenu)?.label}
                  </Title>
                )}
                <Space>
                  {activeEventTab === "tracks" && selectedMenu === "events" && (
                    <Select
                      style={{ width: 300 }}
                      placeholder="Select an event"
                      value={selectedEventId}
                      onChange={setSelectedEventId}
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {events.map((event) => (
                        <Select.Option key={event.id} value={event.id}>
                          {event.title}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreate}
                    disabled={activeEventTab === "tracks" && !selectedEventId}
                  >
                    Add New
                  </Button>
                </Space>
              </Space>
            </div>

            <Table
              columns={columns}
              dataSource={data}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} items`,
              }}
            />

            <Modal
              title={`${modalType === "create" ? "Create" : "Edit"} ${
                selectedMenu === "events"
                  ? activeEventTab.charAt(0).toUpperCase() +
                    activeEventTab.slice(1, -1)
                  : selectedMenu.charAt(0).toUpperCase() + selectedMenu.slice(1)
              }`}
              open={modalVisible}
              onOk={handleModalOk}
              onCancel={() => {
                setModalVisible(false);
                form.resetFields();
              }}
              width={600}
            >
              <Form form={form} layout="vertical">
                {getModalForm()}
              </Form>
            </Modal>
          </Space>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
