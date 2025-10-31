import {
  BankOutlined,
  CalendarOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  DatePicker,
  Descriptions,
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
  Tooltip,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import {
  eventsAPI,
  sessionsAPI,
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
  const [sessions, setSessions] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedSessionDetails, setSelectedSessionDetails] = useState(null);

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
      } else if (activeEventTab === "tracks" || activeEventTab === "sessions") {
        fetchEvents(); // Need events for tracks and sessions
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

  const fetchSessions = async (eventId) => {
    if (!eventId) return;

    setLoading(true);
    try {
      const response = await sessionsAPI.getAll(eventId);
      setSessions(response.data);
    } catch (error) {
      message.error(
        "Failed to fetch sessions: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch sessions when event is selected and sessions tab is active
  useEffect(() => {
    if (activeEventTab === "sessions" && selectedEventId) {
      fetchSessions(selectedEventId);
      fetchTracks(selectedEventId); // Also fetch tracks for the dropdown
    }
  }, [selectedEventId, activeEventTab]);

  const handleCreate = () => {
    setModalType("create");
    setSelectedRecord(null);
    form.resetFields();

    // Fetch speakers if creating a session and speakers aren't loaded
    if (activeEventTab === "sessions" && speakers.length === 0) {
      fetchSpeakers();
    }

    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setModalType("edit");
    setSelectedRecord(record);

    // For sessions, we need to format the data properly for the form
    if (activeEventTab === "sessions") {
      // Format dates for DatePicker
      const formattedRecord = {
        ...record,
        timeRange:
          record.start_time && record.end_time
            ? [dayjs(record.start_time), dayjs(record.end_time)]
            : null,
        speaker_ids: record.speakers?.map((s) => s.id) || [],
      };
      form.setFieldsValue(formattedRecord);

      // Fetch speakers if not loaded
      if (speakers.length === 0) {
        fetchSpeakers();
      }
    } else {
      form.setFieldsValue(record);
    }

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
          } else if (activeEventTab === "sessions" && selectedEventId) {
            await sessionsAPI.delete(selectedEventId, record.id);
            message.success("Session deleted successfully");
            fetchSessions(selectedEventId);
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
      } else if (activeEventTab === "sessions" && selectedEventId) {
        // Handle session creation/update
        const sessionData = {
          title: values.title,
          description: values.description || "",
          start_time: values.timeRange[0].format("YYYY-MM-DDTHH:mm:ss"),
          end_time: values.timeRange[1].format("YYYY-MM-DDTHH:mm:ss"),
          track: values.track || null,
          speakers_ids: values.speaker_ids || [],
          room: values.room || "",
          metadata: values.metadata || {},
        };

        if (modalType === "create") {
          await sessionsAPI.create(selectedEventId, sessionData);
          message.success("Session created successfully");
        } else {
          await sessionsAPI.update(
            selectedEventId,
            selectedRecord.id,
            sessionData
          );
          message.success("Session updated successfully");
        }

        fetchSessions(selectedEventId);
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

  const handleViewDetails = (record) => {
    setSelectedSessionDetails(record);
    setDetailsModalVisible(true);
  };

  const sessionsColumns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Time",
      dataIndex: "start_time",
      key: "time",
      render: (_, record) => {
        const startTime = dayjs(record.start_time).format("MMM D, YYYY HH:mm");
        const endTime = dayjs(record.end_time).format("HH:mm");
        return (
          <span>
            {startTime} - {endTime}
          </span>
        );
      },
    },
    {
      title: "Speakers",
      dataIndex: "speakers",
      key: "speakers",
      render: (speakers) => {
        if (!speakers || speakers.length === 0) return "-";

        return (
          <Avatar.Group
            max={{
              count: 3,
              style: { color: "#f56a00", backgroundColor: "#fde3cf" },
            }}
          >
            {speakers.map((speaker) => (
              <Tooltip key={speaker.id} title={speaker.name || "Unknown"}>
                {speaker.avatar_url ? (
                  <Avatar
                    src={speaker.avatar_url}
                    style={{ cursor: "default" }}
                  />
                ) : (
                  <Avatar
                    style={{ backgroundColor: "#87d068", cursor: "default" }}
                  >
                    {speaker.name ? speaker.name.charAt(0).toUpperCase() : "?"}
                  </Avatar>
                )}
              </Tooltip>
            ))}
          </Avatar.Group>
        );
      },
    },
    {
      title: "Track",
      dataIndex: "track",
      key: "track",
      render: (trackId) => {
        if (!trackId) return "-";
        const track = tracks.find((t) => t.id === trackId);
        return track ? track.name : "-";
      },
    },
    {
      title: "Room",
      dataIndex: "room",
      key: "room",
      render: (room) => room || "-",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
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
              <Input placeholder="Introduction to AI" />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <Input.TextArea
                rows={3}
                placeholder="Brief description of the session..."
              />
            </Form.Item>
            <Form.Item
              name="timeRange"
              label="Time Range"
              rules={[
                { required: true, message: "Please select the time range" },
              ]}
            >
              <RangePicker
                showTime
                format="YYYY-MM-DD HH:mm"
                style={{ width: "100%" }}
              />
            </Form.Item>
            <Form.Item name="speaker_ids" label="Speakers">
              <Select
                mode="multiple"
                placeholder="Select speakers"
                loading={speakers.length === 0}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
              >
                {speakers.map((speaker) => (
                  <Select.Option key={speaker.id} value={speaker.id}>
                    {speaker.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="track" label="Track">
              <Select
                placeholder="Select a track (optional)"
                allowClear
                loading={tracks.length === 0}
              >
                {tracks.map((track) => (
                  <Select.Option key={track.id} value={track.id}>
                    {track.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="room" label="Room">
              <Input placeholder="Room 101" />
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
                  {(activeEventTab === "tracks" ||
                    activeEventTab === "sessions") &&
                    selectedMenu === "events" && (
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
                    disabled={
                      (activeEventTab === "tracks" ||
                        activeEventTab === "sessions") &&
                      !selectedEventId
                    }
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

            <Modal
              title="Session Details"
              open={detailsModalVisible}
              onCancel={() => {
                setDetailsModalVisible(false);
                setSelectedSessionDetails(null);
              }}
              footer={[
                <Button
                  key="edit"
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setDetailsModalVisible(false);
                    handleEdit(selectedSessionDetails);
                  }}
                >
                  Edit
                </Button>,
                <Button
                  key="close"
                  onClick={() => {
                    setDetailsModalVisible(false);
                    setSelectedSessionDetails(null);
                  }}
                >
                  Close
                </Button>,
              ]}
              width={700}
            >
              {selectedSessionDetails && (
                <Descriptions bordered column={1}>
                  <Descriptions.Item label="Title">
                    {selectedSessionDetails.title}
                  </Descriptions.Item>
                  <Descriptions.Item label="Description">
                    {selectedSessionDetails.description || "-"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Start Time">
                    {dayjs(selectedSessionDetails.start_time).format(
                      "MMMM D, YYYY [at] h:mm A"
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="End Time">
                    {dayjs(selectedSessionDetails.end_time).format(
                      "MMMM D, YYYY [at] h:mm A"
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Duration">
                    {(() => {
                      const start = dayjs(selectedSessionDetails.start_time);
                      const end = dayjs(selectedSessionDetails.end_time);
                      const duration = end.diff(start, "minute");
                      const hours = Math.floor(duration / 60);
                      const minutes = duration % 60;
                      return hours > 0
                        ? `${hours}h ${minutes}m`
                        : `${minutes}m`;
                    })()}
                  </Descriptions.Item>
                  <Descriptions.Item label="Speakers">
                    {selectedSessionDetails.speakers &&
                    selectedSessionDetails.speakers.length > 0 ? (
                      <Space direction="vertical" size="small">
                        {selectedSessionDetails.speakers.map((speaker) => (
                          <Space key={speaker.id}>
                            {speaker.avatar_url ? (
                              <Avatar src={speaker.avatar_url} />
                            ) : (
                              <Avatar style={{ backgroundColor: "#87d068" }}>
                                {speaker.name
                                  ? speaker.name.charAt(0).toUpperCase()
                                  : "?"}
                              </Avatar>
                            )}
                            <span>{speaker.name || "Unknown"}</span>
                          </Space>
                        ))}
                      </Space>
                    ) : (
                      "-"
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Track">
                    {selectedSessionDetails.track
                      ? tracks.find(
                          (t) => t.id === selectedSessionDetails.track
                        )?.name || "-"
                      : "-"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Room">
                    {selectedSessionDetails.room || "-"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Event">
                    {events.find((e) => e.id === selectedEventId)?.title || "-"}
                  </Descriptions.Item>
                </Descriptions>
              )}
            </Modal>
          </Space>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
