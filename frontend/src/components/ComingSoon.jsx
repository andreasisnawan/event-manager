import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const ComingSoon = ({ title = "Coming Soon" }) => {
  const navigate = useNavigate();

  return (
    <Result
      title={title}
      subTitle="This feature is currently under development"
      extra={[
        <Button type="primary" key="home" onClick={() => navigate('/')}>
          Go to Dashboard
        </Button>,
        <Button key="events" onClick={() => navigate('/events')}>
          View Events
        </Button>,
      ]}
    />
  );
};

export default ComingSoon;