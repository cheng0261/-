import { useParams } from 'react-router-dom'
import companyDetails from '../../mock/companyDetails.json'
import { Empty, Descriptions } from 'antd'

interface CompanyInfo {
  name: string
  legalName: string
  industry: string
  scale: string
  address: string
  website: string
  description: string
  relatedLeadIds: string[]
}
interface CompanyDetailsMap {
  [companyName: string]: CompanyInfo
}

export function CompanyPage() {
  const { companyName: rawName } = useParams<{ companyName: string }>()
  const companyName = rawName ? decodeURIComponent(rawName) : ''

  if (!companyName) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
  }

  const companyInfo = (companyDetails as CompanyDetailsMap)[companyName]
  if (!companyInfo) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="企业信息不存在" />
  }

  const { name, legalName, description, relatedLeadIds, ...detailInfo } = companyInfo
  const detailInfoItems = Object.entries(detailInfo).map(([key, value]) => ({
    key,
    label: key,
    children:
      key === 'website'
        ? value && String(value).startsWith('http')
          ? (
              <a href={String(value)} target="_blank" rel="noopener noreferrer">
                {value}
              </a>
            )
          : (
              <span>{value || '—'}</span>
            )
        : value,
  }))

  return (
    <div className="show-info" style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <div className="basic-info" style={{ marginBottom: '16px' }}>
        <div>
          <h2>{name}</h2>
        </div>
        <div>{legalName}</div>
      </div>

      <Descriptions layout="vertical" items={detailInfoItems} />

      <div className="company-description" style={{ marginTop: '20px' }}>
        <h3>企业简介</h3>
        <p>{description}</p>
      </div>

      <div className="related-leads" style={{ marginTop: '20px' }}>
        <h3>关联线索</h3>
        <p>{relatedLeadIds.join('、')}</p>
      </div>
    </div>
  )
}
