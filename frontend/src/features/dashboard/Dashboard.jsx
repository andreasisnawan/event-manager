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
  Upload,
} from "antd";
import { useState } from "react";

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

  // Additional mock data for venues and speakers
  const venues = [
    {
      id: 1,
      name: "Convention Center",
      address: "123 Main St",
      city: "New York",
      capacity: 1000,
      facilities: ["Parking", "WiFi", "AV Equipment"],
    },
  ];

  const speakers = [
    {
      id: 1,
      name: "John Doe",
      title: "Tech Lead",
      company: "Tech Corp",
      bio: "Experienced technology leader",
      topics: ["AI", "Cloud Computing"],
      image: "https://placehold.co/100x100",
    },
  ];

  // Mock data - replace with API calls
  const events = [
    {
      id: 1,
      title: "Tech Conference 2025",
      description: "Annual technology conference",
      startDate: "2025-11-15",
      endDate: "2025-11-17",
      venue: "Convention Center",
      status: "upcoming",
    },
  ];

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

  const tracks = [
    {
      id: 1,
      eventId: 1,
      name: "Main Track",
      description: "Primary conference track",
      color: "blue",
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
      onOk() {
        // Add API call to delete
        message.success("Item deleted successfully");
      },
    });
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      // Add API call to create/edit
      console.log("Form values:", values);
      message.success(
        `Item ${modalType === "create" ? "created" : "updated"} successfully`
      );
      setModalVisible(false);
      form.resetFields();
    });
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
        return track ? <Tag color={track.color}>{track.name}</Tag> : null;
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
      render: (capacity) => `${capacity.toLocaleString()} people`,
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
          <img
            src={record.image}
            alt={record.name}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
          {record.name}
        </Space>
      ),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Company",
      dataIndex: "company",
      key: "company",
    },
    {
      title: "Topics",
      dataIndex: "topics",
      key: "topics",
      render: (topics) => (
        <Space wrap>
          {topics.map((topic) => (
            <Tag key={topic} color="blue">
              {topic}
            </Tag>
          ))}
        </Space>
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
      title: "Color",
      dataIndex: "color",
      key: "color",
      render: (color) => <Tag color={color}>{color}</Tag>,
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
              name="color"
              label="Color"
              rules={[{ required: true, message: "Please select a color" }]}
            >
              <Select>
                <Select.Option value="blue">Blue</Select.Option>
                <Select.Option value="green">Green</Select.Option>
                <Select.Option value="red">Red</Select.Option>
                <Select.Option value="yellow">Yellow</Select.Option>
                <Select.Option value="purple">Purple</Select.Option>
              </Select>
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
              <Input />
            </Form.Item>
            <Form.Item
              name="address"
              label="Address"
              rules={[{ required: true, message: "Please enter the address" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="city"
              label="City"
              rules={[{ required: true, message: "Please enter the city" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="capacity"
              label="Capacity"
              rules={[{ required: true, message: "Please enter the capacity" }]}
            >
              <Input type="number" min={0} />
            </Form.Item>
            <Form.Item
              name="facilities"
              label="Facilities"
              rules={[{ required: true, message: "Please select facilities" }]}
            >
              <Select mode="tags" placeholder="Add facilities">
                <Select.Option value="Parking">Parking</Select.Option>
                <Select.Option value="WiFi">WiFi</Select.Option>
                <Select.Option value="AV Equipment">AV Equipment</Select.Option>
                <Select.Option value="Catering">Catering</Select.Option>
                <Select.Option value="Stage">Stage</Select.Option>
              </Select>
            </Form.Item>
          </>
        );
      case "speakers":
        return (
          <>
            <Form.Item
              name="image"
              label="Profile Image"
              rules={[{ required: true, message: "Please upload an image" }]}
            >
              <Upload
                maxCount={1}
                listType="picture-card"
                beforeUpload={() => false}
              >
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              </Upload>
            </Form.Item>
            <Form.Item
              name="name"
              label="Name"
              rules={[
                { required: true, message: "Please enter the speaker name" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="title"
              label="Title"
              rules={[{ required: true, message: "Please enter the title" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="company"
              label="Company"
              rules={[{ required: true, message: "Please enter the company" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="bio"
              label="Bio"
              rules={[{ required: true, message: "Please enter a bio" }]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>
            <Form.Item
              name="topics"
              label="Topics"
              rules={[{ required: true, message: "Please add topics" }]}
            >
              <Select mode="tags" placeholder="Add topics" />
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

  const eventSegments = ["events", "sessions", "tracks"];

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
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreate}
                >
                  Add New
                </Button>
              </Space>
            </div>

            <Table
              columns={columns}
              dataSource={data}
              rowKey="id"
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
